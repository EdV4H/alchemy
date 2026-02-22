import { Alchemist, OpenAITransmuter } from "@EdV4H/alchemy-node";
import { Hono } from "hono";
import { recipeRegistry } from "../shared/recipes.js";

const app = new Hono();

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

app.post("/api/transmute/:recipeId", async (c) => {
  const { recipeId } = c.req.param();
  const recipe = recipeRegistry[recipeId];

  if (!recipe) {
    return c.json({ error: `Unknown recipe: ${recipeId}` }, 404);
  }

  const { material } = await c.req.json<{ material: string }>();

  if (!material || typeof material !== "string") {
    return c.json({ error: "material (string) is required" }, 400);
  }

  try {
    const result = await alchemist.transmute(recipe, material);
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json({ error: message }, 500);
  }
});

export default app;
