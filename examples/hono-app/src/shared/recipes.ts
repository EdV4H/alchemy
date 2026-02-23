import type { MaterialPart, Recipe } from "@EdV4H/alchemy-node";
import {
  extractText,
  filterByType,
  JsonRefiner,
  prependText,
  TextRefiner,
  truncateText,
} from "@EdV4H/alchemy-node";
import { z } from "zod";

// ─── Recipe Metadata Types ─────────────────────────────────────────────────

export interface RecipeFieldMeta {
  name: string;
  type: string; // "string", "number", 'enum("a"|"b")', "string[]" etc.
  children?: RecipeFieldMeta[]; // nested object fields
}

export interface RecipeMeta {
  outputType: "text" | "json";
  schemaFields?: RecipeFieldMeta[]; // json only
  transforms: string[]; // human-readable e.g. "truncateText(2000)"
  promptTemplate: string; // spell summary
}

// ─── Zod Introspection Helpers ─────────────────────────────────────────────

function describeZodType(t: z.ZodTypeAny): string {
  if (t instanceof z.ZodString) return "string";
  if (t instanceof z.ZodNumber) return "number";
  if (t instanceof z.ZodBoolean) return "boolean";
  if (t instanceof z.ZodEnum)
    return `enum(${(t.options as string[]).map((o) => `"${o}"`).join(" | ")})`;
  if (t instanceof z.ZodArray) return `${describeZodType(t.element)}[]`;
  if (t instanceof z.ZodObject) return "object";
  return "unknown";
}

function zodToFieldMeta(schema: z.ZodObject<z.ZodRawShape>): RecipeFieldMeta[] {
  return Object.entries(schema.shape).map(([name, field]) => {
    const f = field as z.ZodTypeAny;
    // Expand children for arrays of objects
    const inner =
      f instanceof z.ZodArray && f.element instanceof z.ZodObject
        ? zodToFieldMeta(f.element as z.ZodObject<z.ZodRawShape>)
        : // Expand children for direct objects
          f instanceof z.ZodObject
          ? zodToFieldMeta(f as z.ZodObject<z.ZodRawShape>)
          : undefined;
    return { name, type: describeZodType(f), children: inner };
  });
}

// ─── Recipe 1: Professional Rewriter ───────────────────────────────────────
// Demo: basic text→text with TextRefiner

export const rewriteRecipe: Recipe<MaterialPart[], string> = {
  id: "rewrite",
  name: "Professional Rewriter",
  catalyst: {
    roleDefinition:
      "You are a professional editor. Rewrite the given text to be polished, clear, and well-structured. Keep the original meaning but improve style and readability. Reply with the rewritten text only.",
    temperature: 0.4,
  },
  spell: (parts) => [
    { type: "text", text: "Rewrite the following text in a professional, polished style:" },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 2: Sentiment Analysis ──────────────────────────────────────────
// Demo: JsonRefiner + Zod enum + truncateText transform

export const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral", "mixed"]),
  confidence: z.number().min(0).max(1),
  emotions: z.array(z.string()),
  summary: z.string(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const sentimentRecipe: Recipe<MaterialPart[], Sentiment> = {
  id: "sentiment",
  name: "Sentiment Analysis",
  catalyst: {
    roleDefinition:
      "You are a sentiment analysis expert. Analyze text for sentiment, emotional tone, and confidence level.",
    temperature: 0,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Analyze the sentiment of the following text. Return a JSON object with these exact fields:
- "sentiment": one of "positive", "negative", "neutral", or "mixed"
- "confidence": a number between 0 and 1
- "emotions": an array of emotion strings
- "summary": a brief summary string

Text to analyze:

${text}`;
  },
  refiner: new JsonRefiner(SentimentSchema),
  transforms: [truncateText(2000)],
};

// ─── Recipe 3: Smart Translator ────────────────────────────────────────────
// Demo: async spell + 複数 MaterialPart 合成、自動言語検出 (EN↔JA)

export const translateAdaptRecipe: Recipe<MaterialPart[], string> = {
  id: "translate-adapt",
  name: "Smart Translator",
  catalyst: {
    roleDefinition:
      "You are a professional translator specializing in English and Japanese. Detect the source language and translate to the other language. Produce natural, fluent output. Reply with the translation only.",
    temperature: 0.3,
  },
  spell: async (parts): Promise<MaterialPart[]> => {
    const text = extractText(parts);
    return [
      {
        type: "text",
        text: "Detect the language of the following text. If English, translate to Japanese. If Japanese, translate to English. Reply with the translation only.",
      },
      { type: "text", text: `Source text:\n${text}` },
    ];
  },
  refiner: new TextRefiner(),
};

// ─── Recipe 4: Code Review ─────────────────────────────────────────────────
// Demo: コード特化 + ネスト Zod + filterByType transform

const CodeIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  line: z.string(),
  message: z.string(),
  suggestion: z.string(),
});

export const CodeReviewSchema = z.object({
  language: z.string(),
  issues: z.array(CodeIssueSchema),
  strengths: z.array(z.string()),
  overallScore: z.number().min(1).max(10),
  summary: z.string(),
});

export type CodeReview = z.infer<typeof CodeReviewSchema>;

export const codeReviewRecipe: Recipe<MaterialPart[], CodeReview> = {
  id: "code-review",
  name: "Code Review",
  catalyst: {
    roleDefinition:
      "You are a senior software engineer performing a code review. Identify bugs, anti-patterns, security issues, and style problems. Also highlight strengths. Be specific about line references.",
    temperature: 0,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Review the following code. Return a JSON object with these exact fields:
- "language": the programming language (string)
- "issues": an array of objects, each with "severity" ("error"|"warning"|"info"), "line" (string), "message" (string), "suggestion" (string)
- "strengths": an array of strength strings
- "overallScore": a number from 1 to 10
- "summary": a brief summary string

Code to review:

${text}`;
  },
  refiner: new JsonRefiner(CodeReviewSchema),
  transforms: [filterByType("text")],
};

// ─── Recipe 5: Code Explainer ──────────────────────────────────────────────
// Demo: チェーン transform (filterByType + prependText)

export const codeExplainRecipe: Recipe<MaterialPart[], string> = {
  id: "code-explain",
  name: "Code Explainer",
  catalyst: {
    roleDefinition:
      "You are a patient programming teacher. Explain code clearly, covering what it does, how it works, and why certain patterns are used. Use simple language suitable for intermediate developers.",
    temperature: 0.3,
  },
  spell: (parts) => parts,
  refiner: new TextRefiner(),
  transforms: [
    filterByType("text"),
    prependText(
      "Explain the following code in detail. Cover what it does, how it works, key patterns used, and any notable design decisions:\n\n",
    ),
  ],
};

// ─── Recipe 6: Image Analysis ──────────────────────────────────────────────
// Demo: ImageMaterialPart + model override
// Note: transforms (imageUrlToBase64) injected server-side

export const imageAnalysisRecipe: Recipe<MaterialPart[], string> = {
  id: "image-analysis",
  name: "Image Analysis",
  catalyst: {
    roleDefinition:
      "You are a helpful image analyst. Describe and analyze images based on the user's instructions.",
    temperature: 0.3,
    model: "gpt-4o",
  },
  spell: (parts) => parts,
  refiner: new TextRefiner(),
};

// ─── Recipe 7: Smart Summarizer ────────────────────────────────────────────
// Demo: 多段階要約 + truncateText transform

export const SummarySchema = z.object({
  oneLiner: z.string(),
  keyPoints: z.array(z.string()),
  detailedSummary: z.string(),
  wordCountOriginal: z.number(),
  wordCountSummary: z.number(),
});

export type Summary = z.infer<typeof SummarySchema>;

export const summarizeRecipe: Recipe<MaterialPart[], Summary> = {
  id: "summarize",
  name: "Smart Summarizer",
  catalyst: {
    roleDefinition:
      "You are an expert summarizer. Produce structured summaries that capture the essence of the input at multiple levels of detail.",
    temperature: 0.2,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Summarize the following text. Return a JSON object with these exact fields:
- "oneLiner": a single-sentence summary
- "keyPoints": an array of key point strings
- "detailedSummary": a detailed paragraph summary
- "wordCountOriginal": word count of the original text (number)
- "wordCountSummary": word count of your detailedSummary (number)

Text to summarize:

${text}`;
  },
  refiner: new JsonRefiner(SummarySchema),
  transforms: [truncateText(4000)],
};

// ─── Recipe 8: Entity & Fact Extraction ────────────────────────────────────
// Demo: 深くネストされた Zod スキーマ

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

export const structuredExtractRecipe: Recipe<MaterialPart[], Extraction> = {
  id: "structured-extract",
  name: "Entity & Fact Extraction",
  catalyst: {
    roleDefinition:
      "You are an information extraction specialist. Extract entities, key facts, and metadata from text with precision.",
    temperature: 0,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Extract all named entities, key facts, and metadata from the following text. Return a JSON object with these exact fields:
- "entities": an array of objects, each with "name" (string), "type" ("person"|"organization"|"location"|"event"|"other"), "context" (string)
- "keyFacts": an array of fact strings
- "wordCount": word count of the original text (number)

Text to analyze:

${text}`;
  },
  refiner: new JsonRefiner(ExtractionSchema),
};

// ─── Recipe 9: Data Analyst ──────────────────────────────────────────────────
// Demo: DataMaterialPart + dataToText transform (server-side)

export const DataAnalysisSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  anomalies: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type DataAnalysis = z.infer<typeof DataAnalysisSchema>;

export const dataAnalystRecipe: Recipe<MaterialPart[], DataAnalysis> = {
  id: "data-analyst",
  name: "Data Analyst",
  catalyst: {
    roleDefinition:
      "You are a data analyst expert. Analyze structured data (CSV, JSON, TSV) and provide insights, identify anomalies, and suggest actionable recommendations.",
    temperature: 0.2,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Analyze the following data. Return a JSON object with these exact fields:
- "summary": a concise overview of the data
- "insights": an array of key insight strings
- "anomalies": an array of anomaly or outlier descriptions
- "recommendations": an array of actionable recommendation strings

Data to analyze:

${text}`;
  },
  refiner: new JsonRefiner(DataAnalysisSchema),
};

// ─── Recipe 10: Document Summarizer ─────────────────────────────────────────
// Demo: DocumentMaterialPart + documentToText + truncateText transforms (server-side)

export const docSummarizerRecipe: Recipe<MaterialPart[], Summary> = {
  id: "doc-summarizer",
  name: "Document Summarizer",
  catalyst: {
    roleDefinition:
      "You are an expert document summarizer. Produce structured summaries that capture the essence of the document at multiple levels of detail.",
    temperature: 0.2,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Summarize the following document. Return a JSON object with these exact fields:
- "oneLiner": a single-sentence summary
- "keyPoints": an array of key point strings
- "detailedSummary": a detailed paragraph summary
- "wordCountOriginal": word count of the original document (number)
- "wordCountSummary": word count of your detailedSummary (number)

Document to summarize:

${text}`;
  },
  refiner: new JsonRefiner(SummarySchema),
};

// ─── Recipe Registry ────────────────────────────────────────────────────────

export interface RecipeEntry {
  // biome-ignore lint/suspicious/noExplicitAny: recipe output types vary
  recipe: Recipe<MaterialPart[], any>;
  label: string;
  icon: string;
  description: string;
  meta: RecipeMeta;
}

export const recipeEntries: RecipeEntry[] = [
  {
    recipe: rewriteRecipe,
    label: "Rewrite",
    icon: "\u270D\uFE0F",
    description: "Rewrite text in a professional, polished style",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate: "Rewrite the following text in a professional, polished style: ...materials",
    },
  },
  {
    recipe: sentimentRecipe,
    label: "Sentiment",
    icon: "\uD83D\uDD2E",
    description: "Analyze sentiment, emotions, and confidence",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(SentimentSchema),
      transforms: ["truncateText(2000)"],
      promptTemplate:
        "Analyze the sentiment of the following text → {sentiment, confidence, emotions, summary}",
    },
  },
  {
    recipe: translateAdaptRecipe,
    label: "Translate",
    icon: "\uD83C\uDF0D",
    description: "Auto-detect language and translate (EN\u2194JA)",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate: "Detect language → translate EN↔JA. Reply with translation only.",
    },
  },
  {
    recipe: codeReviewRecipe,
    label: "Code Review",
    icon: "\uD83D\uDD0D",
    description: "Review code for bugs, anti-patterns, and style issues",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(CodeReviewSchema),
      transforms: ['filterByType("text")'],
      promptTemplate:
        "Review the following code → {language, issues[], strengths[], overallScore, summary}",
    },
  },
  {
    recipe: codeExplainRecipe,
    label: "Code Explain",
    icon: "\uD83D\uDCD6",
    description: "Explain code in detail with patterns and design decisions",
    meta: {
      outputType: "text",
      transforms: ['filterByType("text")', 'prependText("Explain the following code...")'],
      promptTemplate: "...materials (prepended with explanation instruction)",
    },
  },
  {
    recipe: imageAnalysisRecipe,
    label: "Image Analysis",
    icon: "\uD83D\uDDBC\uFE0F",
    description: "Analyze an image from a URL",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate: "...materials (image parts passed directly)",
    },
  },
  {
    recipe: summarizeRecipe,
    label: "Summarize",
    icon: "\uD83D\uDCDD",
    description: "Produce structured multi-level summaries",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(SummarySchema),
      transforms: ["truncateText(4000)"],
      promptTemplate:
        "Summarize the text → {oneLiner, keyPoints[], detailedSummary, wordCountOriginal, wordCountSummary}",
    },
  },
  {
    recipe: structuredExtractRecipe,
    label: "Extract",
    icon: "\uD83D\uDDC2\uFE0F",
    description: "Extract entities, facts, and metadata as structured JSON",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(ExtractionSchema),
      transforms: [],
      promptTemplate:
        "Extract entities, key facts, and metadata → {entities[], keyFacts[], wordCount}",
    },
  },
  {
    recipe: dataAnalystRecipe,
    label: "Data Analyst",
    icon: "\uD83D\uDCCA",
    description: "Analyze structured data (CSV/JSON/TSV) for insights and anomalies",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(DataAnalysisSchema),
      transforms: ["dataToText()"],
      promptTemplate: "Analyze the data → {summary, insights[], anomalies[], recommendations[]}",
    },
  },
  {
    recipe: docSummarizerRecipe,
    label: "Doc Summary",
    icon: "\uD83D\uDCC4",
    description: "Summarize documents with structured multi-level output",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(SummarySchema),
      transforms: ["documentToText()", "truncateText(8000)"],
      promptTemplate:
        "Summarize the document → {oneLiner, keyPoints[], detailedSummary, wordCountOriginal, wordCountSummary}",
    },
  },
];

// biome-ignore lint/suspicious/noExplicitAny: recipe output types vary
export const recipeRegistry: Record<string, Recipe<MaterialPart[], any>> = Object.fromEntries(
  recipeEntries.map((e) => [e.recipe.id, e.recipe]),
);
