import type { Recipe } from "@EdV4H/alchemy-node";
import { JsonRefiner, TextRefiner } from "@EdV4H/alchemy-node";
import { z } from "zod";

// ─── Summary Recipe ─────────────────────────────────────────────────────────

export const summaryRecipe: Recipe<string, string> = {
  id: "summary",
  catalyst: {
    roleDefinition: "You are a concise summarizer. Reply in 2-3 sentences.",
    temperature: 0.3,
  },
  spell: (text: string) => `Summarize the following text:\n\n${text}`,
  refiner: new TextRefiner(),
};

// ─── Sentiment Analysis Recipe ──────────────────────────────────────────────

export const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const sentimentRecipe: Recipe<string, Sentiment> = {
  id: "sentiment",
  catalyst: {
    roleDefinition: "You are a sentiment analysis expert. Analyze the sentiment of the given text.",
    temperature: 0,
  },
  spell: (text: string) =>
    `Analyze the sentiment of the following text and respond with JSON containing: sentiment ("positive", "negative", or "neutral"), confidence (0-1), and reason (brief explanation).\n\n${text}`,
  refiner: new JsonRefiner(SentimentSchema),
};

// ─── Translation Recipe ─────────────────────────────────────────────────────

export const translationRecipe: Recipe<string, string> = {
  id: "translation",
  name: "Translation (EN → JA)",
  catalyst: {
    roleDefinition:
      "You are a professional translator. Translate the given English text into natural Japanese. Reply with the translation only.",
    temperature: 0.3,
  },
  spell: (text: string) => `Translate the following English text into Japanese:\n\n${text}`,
  refiner: new TextRefiner(),
};

// ─── Key Points Extraction Recipe ───────────────────────────────────────────

export const KeyPointsSchema = z.object({
  points: z.array(z.string()),
});

export type KeyPoints = z.infer<typeof KeyPointsSchema>;

export const keyPointsRecipe: Recipe<string, KeyPoints> = {
  id: "key-points",
  name: "Key Points Extraction",
  catalyst: {
    roleDefinition:
      "You are an analyst who extracts key points from text. Return 3-5 bullet points.",
    temperature: 0.2,
  },
  spell: (text: string) =>
    `Extract 3-5 key points from the following text. Respond with JSON containing a "points" array of strings.\n\n${text}`,
  refiner: new JsonRefiner(KeyPointsSchema),
};

// ─── Recipe Registry ────────────────────────────────────────────────────────

export interface RecipeEntry {
  recipe: Recipe<string, unknown>;
  label: string;
  description: string;
}

export const recipeEntries: RecipeEntry[] = [
  { recipe: summaryRecipe, label: "Summary", description: "Summarize in 2-3 sentences" },
  {
    recipe: sentimentRecipe,
    label: "Sentiment",
    description: "Analyze sentiment (positive/negative/neutral)",
  },
  { recipe: translationRecipe, label: "Translate", description: "Translate English to Japanese" },
  { recipe: keyPointsRecipe, label: "Key Points", description: "Extract 3-5 key points" },
];

export const recipeRegistry: Record<string, Recipe<string, unknown>> = Object.fromEntries(
  recipeEntries.map((e) => [e.recipe.id, e.recipe]),
);
