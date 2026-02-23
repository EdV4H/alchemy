import type { CatalystConfig, MaterialPart } from "@EdV4H/alchemy-node";
import {
  Alchemist,
  dataToText,
  documentToText,
  imageUrlToBase64,
  OpenAITransmuter,
  truncateText,
} from "@EdV4H/alchemy-node";
import { Hono } from "hono";
import { catalystPresets } from "../shared/catalysts.js";
import { recipeRegistry } from "../shared/recipes.js";

const app = new Hono();

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

// Inject Node-specific transforms at server init
recipeRegistry["image-analysis"].transforms = [imageUrlToBase64()];
recipeRegistry["data-analyst"].transforms = [dataToText()];
recipeRegistry["doc-summarizer"].transforms = [documentToText(), truncateText(8000)];

interface MaterialInput {
  type: "text" | "image" | "audio" | "document" | "video" | "data";
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  documentUrl?: string;
  documentText?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  dataLabel?: string;
}

function toMaterialParts(materials: MaterialInput[]): MaterialPart[] {
  return materials.flatMap((m): MaterialPart[] => {
    switch (m.type) {
      case "text":
        return m.text ? [{ type: "text", text: m.text }] : [];
      case "image":
        return m.imageUrl ? [{ type: "image", source: { kind: "url", url: m.imageUrl } }] : [];
      case "audio":
        return m.audioUrl ? [{ type: "audio", source: { kind: "url", url: m.audioUrl } }] : [];
      case "document":
        if (m.documentUrl) {
          return [{ type: "document", source: { kind: "url", url: m.documentUrl } }];
        }
        if (m.documentText) {
          return [{ type: "document", source: { kind: "text", text: m.documentText } }];
        }
        return [];
      case "video":
        return m.videoUrl ? [{ type: "video", source: { kind: "url", url: m.videoUrl } }] : [];
      case "data":
        return m.dataFormat && m.dataContent
          ? [{ type: "data", format: m.dataFormat, content: m.dataContent, label: m.dataLabel }]
          : [];
      default:
        return [];
    }
  });
}

function resolveCatalystPreset(key?: string): CatalystConfig | undefined {
  if (!key) return undefined;
  return catalystPresets.find((c) => c.key === key)?.config;
}

interface TransmuteBody {
  materials: MaterialInput[];
  catalystKey?: string;
}

app.post("/api/transmute/:recipeId", async (c) => {
  const { recipeId } = c.req.param();
  const recipe = recipeRegistry[recipeId];

  if (!recipe) {
    return c.json({ error: `Unknown recipe: ${recipeId}` }, 404);
  }

  const body = await c.req.json<TransmuteBody>();
  const materials = body.materials;

  if (!Array.isArray(materials) || materials.length === 0) {
    return c.json({ error: "materials (MaterialInput[]) is required" }, 400);
  }

  try {
    const parts = toMaterialParts(materials);
    const catalyst = resolveCatalystPreset(body.catalystKey);
    const result = await alchemist.transmute(recipe, parts, { catalyst });
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

interface CompareBody {
  materials: MaterialInput[];
  catalystKeys: string[];
}

app.post("/api/compare/:recipeId", async (c) => {
  const { recipeId } = c.req.param();
  const recipe = recipeRegistry[recipeId];

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
    const parts = toMaterialParts(materials);
    const catalysts: Record<string, CatalystConfig> = {};
    for (const key of body.catalystKeys) {
      const config = resolveCatalystPreset(key);
      if (config) catalysts[key] = config;
    }
    const results = await alchemist.compare(recipe, parts, catalysts);
    return c.json(results);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

export default app;
