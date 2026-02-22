import type { MaterialPart, Recipe } from "@EdV4H/alchemy-node";
import { JsonRefiner, TextRefiner } from "@EdV4H/alchemy-node";
import { z } from "zod";

// ─── Recipe 1: Professional Rewriter ───────────────────────────────────────
// Demo: roleDefinition persona + TextRefiner (basic text→text transform)

export const rewriteRecipe: Recipe<string, string> = {
  id: "rewrite",
  name: "Professional Rewriter",
  catalyst: {
    roleDefinition:
      "You are a professional editor. Rewrite the given text to be polished, clear, and well-structured. Keep the original meaning but improve style and readability. Reply with the rewritten text only.",
    temperature: 0.4,
  },
  spell: (text: string) =>
    `Rewrite the following text in a professional, polished style:\n\n${text}`,
  refiner: new TextRefiner(),
};

// ─── Recipe 2: Sentiment Analysis ──────────────────────────────────────────
// Demo: JsonRefiner + Zod enum / array / number のリッチスキーマ

export const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral", "mixed"]),
  confidence: z.number().min(0).max(1),
  emotions: z.array(z.string()),
  summary: z.string(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const sentimentRecipe: Recipe<string, Sentiment> = {
  id: "sentiment",
  name: "Sentiment Analysis",
  catalyst: {
    roleDefinition:
      "You are a sentiment analysis expert. Analyze text for sentiment, emotional tone, and confidence level.",
    temperature: 0,
  },
  spell: (text: string) =>
    `Analyze the sentiment of the following text. Identify the overall sentiment, your confidence level (0-1), the emotions present, and a brief summary.\n\n${text}`,
  refiner: new JsonRefiner(SentimentSchema),
};

// ─── Recipe 3: Smart Translator ────────────────────────────────────────────
// Demo: async spell + 複数 TextMaterialPart 合成、自動言語検出 (EN↔JA)

export const translateAdaptRecipe: Recipe<string, string> = {
  id: "translate-adapt",
  name: "Smart Translator",
  catalyst: {
    roleDefinition:
      "You are a professional translator specializing in English and Japanese. Detect the source language and translate to the other language. Produce natural, fluent output. Reply with the translation only.",
    temperature: 0.3,
  },
  spell: async (text: string): Promise<MaterialPart[]> => {
    // Build multiple TextMaterialParts — instructions separated from content
    const parts: MaterialPart[] = [
      {
        type: "text",
        text: "Detect the language of the following text. If English, translate to Japanese. If Japanese, translate to English. Reply with the translation only.",
      },
      { type: "text", text: `Source text:\n${text}` },
    ];
    return parts;
  },
  refiner: new TextRefiner(),
};

// ─── Recipe 4: Entity & Fact Extraction ────────────────────────────────────
// Demo: 深くネストされた Zod スキーマ（配列内オブジェクト、enum）

const EntitySchema = z.object({
  name: z.string(),
  type: z.enum(["person", "organization", "location", "event", "other"]),
  context: z.string(),
});

export const ExtractionSchema = z.object({
  entities: z.array(EntitySchema),
  keyFacts: z.array(z.string()),
  wordCount: z.number(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

export const structuredExtractRecipe: Recipe<string, Extraction> = {
  id: "structured-extract",
  name: "Entity & Fact Extraction",
  catalyst: {
    roleDefinition:
      "You are an information extraction specialist. Extract entities, key facts, and metadata from text with precision.",
    temperature: 0,
  },
  spell: (text: string) =>
    `Extract all named entities (with their type and context), key facts, and the word count from the following text:\n\n${text}`,
  refiner: new JsonRefiner(ExtractionSchema),
};

// ─── Recipe 5: Image Analysis ──────────────────────────────────────────────
// Demo: Image URL MaterialPart + 複合 TInput + model override

export interface ImageAnalysisInput {
  text: string;
  imageUrl: string;
}

export const imageAnalysisRecipe: Recipe<ImageAnalysisInput, string> = {
  id: "image-analysis",
  name: "Image Analysis",
  catalyst: {
    roleDefinition:
      "You are a helpful image analyst. Describe and analyze images based on the user's instructions.",
    temperature: 0.3,
    model: "gpt-4o",
  },
  spell: (input: ImageAnalysisInput): MaterialPart[] => [
    { type: "text", text: input.text },
    { type: "image", source: { kind: "url", url: input.imageUrl } },
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe Registry ────────────────────────────────────────────────────────

export interface RecipeEntry {
  // biome-ignore lint/suspicious/noExplicitAny: recipe input types vary (string | ImageAnalysisInput)
  recipe: Recipe<any, unknown>;
  label: string;
  icon: string;
  description: string;
}

export const recipeEntries: RecipeEntry[] = [
  {
    recipe: rewriteRecipe,
    label: "Rewrite",
    icon: "\u270D\uFE0F",
    description: "Rewrite text in a professional, polished style",
  },
  {
    recipe: sentimentRecipe,
    label: "Sentiment",
    icon: "\uD83D\uDD2E",
    description: "Analyze sentiment, emotions, and confidence",
  },
  {
    recipe: translateAdaptRecipe,
    label: "Translate",
    icon: "\uD83C\uDF0D",
    description: "Auto-detect language and translate (EN\u2194JA)",
  },
  {
    recipe: structuredExtractRecipe,
    label: "Extract",
    icon: "\uD83D\uDDC2\uFE0F",
    description: "Extract entities, facts, and metadata as structured JSON",
  },
  {
    recipe: imageAnalysisRecipe,
    label: "Image Analysis",
    icon: "\uD83D\uDDBC\uFE0F",
    description: "Analyze an image from a URL",
  },
];

// biome-ignore lint/suspicious/noExplicitAny: recipe input types vary (string | ImageAnalysisInput)
export const recipeRegistry: Record<string, Recipe<any, unknown>> = Object.fromEntries(
  recipeEntries.map((e) => [e.recipe.id, e.recipe]),
);
