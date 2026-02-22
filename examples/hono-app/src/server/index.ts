import { Alchemist, OpenAITransmuter } from "@EdV4H/alchemy-node";
import { Hono } from "hono";
import { recipeRegistry } from "../shared/recipes.js";

const app = new Hono();

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

interface TransmuteBody {
  materials: string[];
  imageUrl?: string;
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
    return c.json({ error: "materials (string[]) is required" }, 400);
  }

  try {
    const combined = materials.join("\n\n---\n\n");
    const input =
      recipe.id === "image-analysis" ? { text: combined, imageUrl: body.imageUrl ?? "" } : combined;
    const result = await alchemist.transmute(recipe, input);
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

export default app;
