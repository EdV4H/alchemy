import type { CatalystConfig, MaterialPart, MaterialTransform } from "@EdV4H/alchemy-node";
import {
  dataToText,
  documentToText,
  extractAllText,
  extractText,
  filterByType,
  imageUrlToBase64,
  isTextOnly,
  JsonRefiner,
  prependText,
  TextRefiner,
  truncateText,
} from "@EdV4H/alchemy-node";
import { Hono } from "hono";
import { z } from "zod";
import type { ServerMaterialInput } from "./index.js";
import { resolveAlchemist, serverToMaterialParts } from "./index.js";

type Bindings = { OPENAI_API_KEY?: string };
const app = new Hono<{ Bindings: Bindings }>();

// ─── Transform registry ─────────────────────────────────────────────────────

type TransformFactory = (args: string[]) => MaterialTransform;

const TRANSFORM_REGISTRY: Record<string, TransformFactory> = {
  truncateText: (args) => truncateText(args[0] ? Number(args[0]) : 4000),
  filterByType: (args) => filterByType(args[0] as MaterialPart["type"]),
  prependText: (args) => prependText(args[0] ?? ""),
  dataToText: () => dataToText(),
  documentToText: () => documentToText(),
  imageUrlToBase64: () => imageUrlToBase64(),
};

function parseTransform(expr: string): MaterialTransform {
  const match = expr.match(/^(\w+)\((.*)\)$/);
  if (!match) {
    throw new Error(`Invalid transform expression: ${expr}`);
  }
  const [, name, rawArgs] = match;
  const factory = TRANSFORM_REGISTRY[name];
  if (!factory) {
    throw new Error(
      `Unknown transform: ${name}. Available: ${Object.keys(TRANSFORM_REGISTRY).join(", ")}`,
    );
  }
  const args = rawArgs ? rawArgs.split(",").map((a) => a.trim().replace(/^["']|["']$/g, "")) : [];
  return factory(args);
}

// ─── Spell builder ──────────────────────────────────────────────────────────

const TEMPLATE_VARS: Record<string, (parts: MaterialPart[]) => string> = {
  text: (parts) => extractText(parts),
  allText: (parts) => extractAllText(parts),
  textOnly: (parts) => String(isTextOnly(parts)),
};

function buildSpellFromTemplate(template: string) {
  const placeholderPattern = /\{\{(\w+)\}\}/g;
  for (const [, varName] of template.matchAll(placeholderPattern)) {
    if (!(varName in TEMPLATE_VARS)) {
      throw new Error(
        `Unknown template variable: {{${varName}}}. Available: ${Object.keys(TEMPLATE_VARS).join(", ")}`,
      );
    }
  }
  return (parts: MaterialPart[]): string => {
    let result = template;
    for (const [name, resolver] of Object.entries(TEMPLATE_VARS)) {
      result = result.replaceAll(`{{${name}}}`, resolver(parts));
    }
    return result;
  };
}

// ─── Request body ───────────────────────────────────────────────────────────

interface PlaygroundTransmuteBody {
  materials: ServerMaterialInput[];
  recipe: {
    promptTemplate: string;
    outputType: "text" | "json";
    transforms?: string[];
  };
  catalyst?: CatalystConfig;
  language?: string;
}

// ─── Endpoint ───────────────────────────────────────────────────────────────

app.post("/transmute", async (c) => {
  const body = await c.req.json<PlaygroundTransmuteBody>();

  // Validate materials
  if (!Array.isArray(body.materials) || body.materials.length === 0) {
    return c.json({ error: "materials (MaterialInput[]) is required" }, 400);
  }

  // Validate recipe
  if (!body.recipe?.promptTemplate) {
    return c.json({ error: "recipe.promptTemplate is required" }, 400);
  }

  // Build spell from template
  let spell: (parts: MaterialPart[]) => string;
  try {
    spell = buildSpellFromTemplate(body.recipe.promptTemplate);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: `Template error: ${message}` }, 400);
  }

  // Build transforms
  let transforms: MaterialTransform[] = [];
  if (body.recipe.transforms && body.recipe.transforms.length > 0) {
    try {
      transforms = body.recipe.transforms.map(parseTransform);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return c.json({ error: `Transform error: ${message}` }, 400);
    }
  }

  // Build refiner
  const refiner =
    body.recipe.outputType === "json"
      ? new JsonRefiner(z.record(z.string(), z.unknown()))
      : new TextRefiner();

  // Assemble recipe
  // biome-ignore lint/suspicious/noExplicitAny: recipe output type varies by outputType
  const recipe: any = {
    id: "playground",
    catalyst: body.catalyst,
    spell,
    refiner,
    transforms,
  };

  try {
    const alchemist = resolveAlchemist(c);
    const parts = serverToMaterialParts(body.materials);
    const result = await alchemist.transmute(recipe, parts, {
      catalyst: body.catalyst,
      language: body.language,
    });
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

export default app;
