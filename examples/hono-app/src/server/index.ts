import type { MaterialPart } from "@EdV4H/alchemy-node";
import { Alchemist, imageUrlToBase64, OpenAITransmuter } from "@EdV4H/alchemy-node";
import { Hono } from "hono";
import { recipeRegistry } from "../shared/recipes.js";

const app = new Hono();

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

// Inject Node-specific transforms at server init
recipeRegistry["image-analysis"].transforms = [imageUrlToBase64()];

interface MaterialInput {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

interface TransmuteBody {
  materials: MaterialInput[];
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
    // Generic MaterialInput[] → MaterialPart[] conversion
    const parts: MaterialPart[] = materials.flatMap((m): MaterialPart[] => {
      if (m.type === "text" && m.text) return [{ type: "text", text: m.text }];
      if (m.type === "image" && m.imageUrl)
        return [{ type: "image", source: { kind: "url", url: m.imageUrl } }];
      return [];
    });

    const result = await alchemist.transmute(recipe, parts);
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

export default app;
