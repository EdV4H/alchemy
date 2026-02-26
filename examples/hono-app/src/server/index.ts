import type { CatalystConfig, MaterialPart } from "@EdV4H/alchemy-node";
import {
  Alchemist,
  AnthropicTransmuter,
  dataToText,
  documentToText,
  GoogleTransmuter,
  imageUrlToBase64,
  OpenAITransmuter,
  toMaterialParts,
  truncateText,
} from "@EdV4H/alchemy-node";
import type { Context } from "hono";
import { Hono } from "hono";
import { catalystPresets } from "../shared/catalysts.js";
import { recipeRegistry } from "../shared/recipes.js";
import { teamLpCatalystPresets } from "../team-lp/catalysts.js";
import { teamLpRecipeRegistry } from "../team-lp/recipes.js";
import { travelCatalystPresets } from "../travel/catalysts.js";
import { travelRecipeRegistry } from "../travel/recipes.js";
import playgroundApp from "./playground.js";

type Bindings = {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
};
const app = new Hono<{ Bindings: Bindings }>();

/**
 * Resolve Alchemist per request.
 * Uses X-Transmuter-Provider header to select provider (default: openai).
 * Each provider reads its own API key header.
 */
export function resolveAlchemist(c: Context<{ Bindings: Bindings }>): Alchemist {
  const provider = c.req.header("X-Transmuter-Provider") ?? "openai";

  switch (provider) {
    case "anthropic": {
      const apiKey =
        c.req.header("X-Anthropic-API-Key") ||
        c.env?.ANTHROPIC_API_KEY ||
        process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Anthropic API key is required. Set it via the UI or ANTHROPIC_API_KEY environment variable.",
        );
      }
      return new Alchemist({ transmuter: new AnthropicTransmuter({ apiKey }) });
    }
    case "google": {
      const apiKey =
        c.req.header("X-Google-API-Key") || c.env?.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Google API key is required. Set it via the UI or GOOGLE_API_KEY environment variable.",
        );
      }
      return new Alchemist({ transmuter: new GoogleTransmuter({ apiKey }) });
    }
    default: {
      const apiKey =
        c.req.header("X-OpenAI-API-Key") || c.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenAI API key is required. Set it via the UI or OPENAI_API_KEY environment variable.",
        );
      }
      return new Alchemist({ transmuter: new OpenAITransmuter({ apiKey }) });
    }
  }
}

// Inject Node-specific transforms at server init (common)
recipeRegistry["image-analysis"].transforms = [imageUrlToBase64()];
recipeRegistry["data-analyst"].transforms = [dataToText()];
recipeRegistry["doc-summarizer"].transforms = [documentToText(), truncateText(8000)];

// Inject Node-specific transforms at server init (travel)
travelRecipeRegistry["photo-caption"].transforms = [imageUrlToBase64()];
travelRecipeRegistry["budget-analysis"].transforms = [dataToText()];
travelRecipeRegistry["trip-summary"].transforms = [
  ...(travelRecipeRegistry["trip-summary"].transforms ?? []),
  dataToText(),
  documentToText(),
];
travelRecipeRegistry["destination-guide"].transforms = [
  ...(travelRecipeRegistry["destination-guide"].transforms ?? []),
  documentToText(),
];

// Inject Node-specific transforms at server init (team-lp)
teamLpRecipeRegistry["team-hero"].transforms = [imageUrlToBase64()];
teamLpRecipeRegistry["team-members"].transforms = [imageUrlToBase64()];
teamLpRecipeRegistry["team-achievements"].transforms = [
  ...(teamLpRecipeRegistry["team-achievements"].transforms ?? []),
  dataToText(),
];
teamLpRecipeRegistry["team-projects"].transforms = [
  ...(teamLpRecipeRegistry["team-projects"].transforms ?? []),
  dataToText(),
];
teamLpRecipeRegistry["team-full-page"].transforms = [imageUrlToBase64(), dataToText()];

// Merge all recipes
// biome-ignore lint/suspicious/noExplicitAny: recipe output types vary
const allRecipes: Record<string, any> = {
  ...recipeRegistry,
  ...travelRecipeRegistry,
  ...teamLpRecipeRegistry,
};

// Merge all catalyst presets
const allCatalystPresets = [...catalystPresets, ...travelCatalystPresets, ...teamLpCatalystPresets];

/**
 * Server-side MaterialInput extends core MaterialInput with documentUrl support.
 * Core toMaterialParts handles all cases except documentUrl, which is server-only.
 */
export type ServerMaterialInput =
  | { type: "text"; text: string }
  | { type: "image"; imageUrl: string }
  | { type: "audio"; audioUrl: string }
  | { type: "document"; documentUrl?: string; documentText?: string }
  | { type: "video"; videoUrl: string }
  | { type: "data"; dataFormat: "csv" | "json" | "tsv"; dataContent: string; dataLabel?: string };

export function serverToMaterialParts(materials: ServerMaterialInput[]): MaterialPart[] {
  // Handle documentUrl (server-only) separately, delegate rest to core
  const serverHandled: MaterialPart[] = [];
  const coreHandled: ServerMaterialInput[] = [];

  for (const m of materials) {
    if (m.type === "document" && m.documentUrl) {
      serverHandled.push({ type: "document", source: { kind: "url", url: m.documentUrl } });
    } else {
      coreHandled.push(m);
    }
  }

  return [...serverHandled, ...toMaterialParts(coreHandled)];
}

function resolveCatalystPreset(key?: string): CatalystConfig | undefined {
  if (!key) return undefined;
  return allCatalystPresets.find((c) => c.key === key)?.config;
}

interface TransmuteBody {
  materials: ServerMaterialInput[];
  catalystKey?: string;
  language?: string;
}

app.post("/api/transmute/:recipeId", async (c) => {
  const { recipeId } = c.req.param();
  const recipe = allRecipes[recipeId];

  if (!recipe) {
    return c.json({ error: `Unknown recipe: ${recipeId}` }, 404);
  }

  const body = await c.req.json<TransmuteBody>();
  const materials = body.materials;

  if (!Array.isArray(materials) || materials.length === 0) {
    return c.json({ error: "materials (MaterialInput[]) is required" }, 400);
  }

  try {
    const alchemist = resolveAlchemist(c);
    const parts = serverToMaterialParts(materials);
    const catalyst = resolveCatalystPreset(body.catalystKey);
    const result = await alchemist.transmute(recipe, parts, { catalyst, language: body.language });
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

interface CompareBody {
  materials: ServerMaterialInput[];
  catalystKeys: string[];
  language?: string;
}

app.post("/api/compare/:recipeId", async (c) => {
  const { recipeId } = c.req.param();
  const recipe = allRecipes[recipeId];

  if (!recipe) {
    return c.json({ error: `Unknown recipe: ${recipeId}` }, 404);
  }

  const body = await c.req.json<CompareBody>();
  const materials = body.materials;

  if (!Array.isArray(materials) || materials.length === 0) {
    return c.json({ error: "materials (MaterialInput[]) is required" }, 400);
  }

  if (!Array.isArray(body.catalystKeys) || body.catalystKeys.length < 2) {
    return c.json({ error: "catalystKeys (string[], min 2) is required" }, 400);
  }

  try {
    const alchemist = resolveAlchemist(c);
    const parts = serverToMaterialParts(materials);
    const catalysts: Record<string, CatalystConfig> = {};
    for (const key of body.catalystKeys) {
      const config = resolveCatalystPreset(key);
      if (config) catalysts[key] = config;
    }
    const results = await alchemist.compare(recipe, parts, catalysts, { language: body.language });
    // Serialize error objects for JSON response
    const serialized = Object.fromEntries(
      Object.entries(results).map(([key, val]) => [
        key,
        val && typeof val === "object" && "error" in val && val.error instanceof Error
          ? { error: val.error.message }
          : val,
      ]),
    );
    return c.json(serialized);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

app.route("/api/playground", playgroundApp);

export default app;
