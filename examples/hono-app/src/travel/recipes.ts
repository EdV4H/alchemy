import type { MaterialPart, Recipe } from "@edv4h/alchemy-node";
import { extractText, JsonRefiner, TextRefiner, truncateText } from "@edv4h/alchemy-node";
import { z } from "zod";
import type { RecipeEntry } from "../shared/recipes.js";
import { zodToFieldMeta } from "../shared/zod-helpers.js";

// ─── Recipe 1: Travel Memory ──────────────────────────────────────────────
// 旅の思い出ストーリー — text output

export const travelMemoryRecipe: Recipe<MaterialPart[], string> = {
  id: "travel-memory",
  name: "Travel Memory Story",
  catalyst: {
    roleDefinition:
      "You are a talented travel writer. Transform travel notes, photos, and data into a compelling narrative that brings the journey to life. Write in a warm, vivid style with sensory details. Output in the same language as the input materials.",
    temperature: 0.7,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following travel materials — notes, photos, data, and documents — craft a vivid, engaging travel story that captures the essence of the journey. Weave together the details into a cohesive narrative:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 2: Travel Highlights ──────────────────────────────────────────
// 旅のハイライト — JSON output

const HighlightMomentSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  rating: z.number(),
});

export const TravelHighlightsSchema = z.object({
  tripTitle: z.string(),
  duration: z.string(),
  topMoments: z.array(HighlightMomentSchema),
  bestPhoto: z.string(),
  oneLiner: z.string(),
  recommendations: z.array(z.string()),
});

export type TravelHighlights = z.infer<typeof TravelHighlightsSchema>;

export const travelHighlightsRecipe: Recipe<MaterialPart[], TravelHighlights> = {
  id: "travel-highlights",
  name: "Travel Highlights",
  catalyst: {
    roleDefinition:
      "You are a highlights curator. Identify the most memorable and noteworthy moments from travel materials and organize them into a structured highlights reel.",
    temperature: 0.3,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Analyze the following travel materials and extract highlights. Return a JSON object with these exact fields:
- "tripTitle": a catchy title for the trip (string)
- "duration": trip duration description (string)
- "topMoments": array of objects with "title" (string), "description" (string), "category" (string like "food", "culture", "nature"), "rating" (1-5 number)
- "bestPhoto": description of the most memorable visual moment (string)
- "oneLiner": a single-sentence trip summary (string)
- "recommendations": array of recommendation strings for future travelers

Travel materials:

${text}`;
  },
  refiner: new JsonRefiner(TravelHighlightsSchema),
  transforms: [truncateText(4000)],
};

// ─── Recipe 3: Travel Blog ─────────────────────────────────────────────────
// 旅行ブログ記事 — text output

export const travelBlogRecipe: Recipe<MaterialPart[], string> = {
  id: "travel-blog",
  name: "Travel Blog Post",
  catalyst: {
    roleDefinition:
      "You are an experienced travel blogger. Write engaging, SEO-friendly blog posts that balance personal anecdotes with useful information. Include section headers and a conversational tone.",
    temperature: 0.6,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following travel materials, write a compelling travel blog post. Include an engaging title, section headers, personal observations, practical tips, and a memorable conclusion:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 4: Photo Caption ───────────────────────────────────────────────
// 写真キャプション生成 — JSON output, model: gpt-4o

const CaptionSchema = z.object({
  description: z.string(),
  shortCaption: z.string(),
  instagramCaption: z.string(),
  hashtags: z.array(z.string()),
  mood: z.string(),
});

export const PhotoCaptionsSchema = z.object({
  captions: z.array(CaptionSchema),
});

export type PhotoCaptions = z.infer<typeof PhotoCaptionsSchema>;

export const photoCaptionRecipe: Recipe<MaterialPart[], PhotoCaptions> = {
  id: "photo-caption",
  name: "Photo Caption Generator",
  catalyst: {
    roleDefinition:
      "You are a creative photo caption specialist. Generate evocative descriptions and social-media-ready captions for travel photos. Capture the mood and story behind each image.",
    temperature: 0.5,
    model: "gpt-4o",
  },
  spell: (parts) => parts,
  refiner: new JsonRefiner(PhotoCaptionsSchema),
};

// ─── Recipe 5: Trip Summary ────────────────────────────────────────────────
// 旅行レポート — JSON output

const DestinationSchema = z.object({
  name: z.string(),
  highlights: z.array(z.string()),
});

const TimelineEntrySchema = z.object({
  day: z.string(),
  activities: z.array(z.string()),
});

export const TripSummarySchema = z.object({
  title: z.string(),
  overview: z.string(),
  destinations: z.array(DestinationSchema),
  timeline: z.array(TimelineEntrySchema),
  expenses: z.string(),
  ratings: z.string(),
  lessonsLearned: z.array(z.string()),
});

export type TripSummary = z.infer<typeof TripSummarySchema>;

export const tripSummaryRecipe: Recipe<MaterialPart[], TripSummary> = {
  id: "trip-summary",
  name: "Trip Summary Report",
  catalyst: {
    roleDefinition:
      "You are a meticulous travel report writer. Compile travel materials into a comprehensive, well-organized trip report with timelines, destinations, and key takeaways.",
    temperature: 0.2,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Compile the following travel materials into a trip summary report. Return a JSON object with these exact fields:
- "title": report title (string)
- "overview": brief trip overview paragraph (string)
- "destinations": array of objects with "name" (string), "highlights" (string array)
- "timeline": array of objects with "day" (string), "activities" (string array)
- "expenses": expense summary (string)
- "ratings": overall trip ratings description (string)
- "lessonsLearned": array of lesson/tip strings

Travel materials:

${text}`;
  },
  refiner: new JsonRefiner(TripSummarySchema),
  transforms: [truncateText(6000)],
};

// ─── Recipe 6: Budget Analysis ─────────────────────────────────────────────
// 旅行費用分析 — JSON output

export const BudgetAnalysisSchema = z.object({
  summary: z.string(),
  totalSpent: z.string(),
  dailyAverage: z.string(),
  categoryBreakdown: z.array(
    z.object({
      category: z.string(),
      amount: z.string(),
      percentage: z.string(),
    }),
  ),
  mostExpensive: z.string(),
  savingTips: z.array(z.string()),
  comparisonNotes: z.string(),
});

export type BudgetAnalysis = z.infer<typeof BudgetAnalysisSchema>;

export const budgetAnalysisRecipe: Recipe<MaterialPart[], BudgetAnalysis> = {
  id: "budget-analysis",
  name: "Budget Analysis",
  catalyst: {
    roleDefinition:
      "You are a travel budget analyst. Analyze travel expense data and provide clear breakdowns, insights, and money-saving tips for future trips.",
    temperature: 0.2,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Analyze the following travel expense data. Return a JSON object with these exact fields:
- "summary": overview of spending patterns (string)
- "totalSpent": total amount spent (string)
- "dailyAverage": average daily spending (string)
- "categoryBreakdown": array of objects with "category" (string), "amount" (string), "percentage" (string)
- "mostExpensive": the most expensive item or category (string)
- "savingTips": array of money-saving tip strings
- "comparisonNotes": comparison notes or benchmarks (string)

Expense data:

${text}`;
  },
  refiner: new JsonRefiner(BudgetAnalysisSchema),
};

// ─── Recipe 7: Destination Guide ───────────────────────────────────────────
// 旅先ガイド生成 — JSON output

export const DestinationGuideSchema = z.object({
  destination: z.string(),
  bestSeason: z.string(),
  mustSee: z.array(z.string()),
  localFood: z.array(z.string()),
  transportation: z.array(z.string()),
  culturalNotes: z.array(z.string()),
  packlist: z.array(z.string()),
});

export type DestinationGuide = z.infer<typeof DestinationGuideSchema>;

export const destinationGuideRecipe: Recipe<MaterialPart[], DestinationGuide> = {
  id: "destination-guide",
  name: "Destination Guide",
  catalyst: {
    roleDefinition:
      "You are a knowledgeable travel guide writer. Create practical, insightful destination guides based on travel materials. Include local tips that only experienced travelers would know.",
    temperature: 0.4,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Based on the following travel materials, create a destination guide. Return a JSON object with these exact fields:
- "destination": destination name (string)
- "bestSeason": best time to visit (string)
- "mustSee": array of must-see attraction strings
- "localFood": array of local food/restaurant recommendation strings
- "transportation": array of transportation tip strings
- "culturalNotes": array of cultural etiquette/note strings
- "packlist": array of recommended packing items

Travel materials:

${text}`;
  },
  refiner: new JsonRefiner(DestinationGuideSchema),
  transforms: [truncateText(4000)],
};

// ─── Recipe Registry ────────────────────────────────────────────────────────

export const travelRecipeEntries: RecipeEntry[] = [
  {
    recipe: travelMemoryRecipe,
    label: "Memory Story",
    icon: "\uD83D\uDCD6",
    description: "Transform travel materials into a vivid journey narrative",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate:
        "Craft a vivid travel story from notes, photos, data, and documents ...materials",
    },
  },
  {
    recipe: travelHighlightsRecipe,
    label: "Highlights",
    icon: "\u2728",
    description: "Extract top moments and recommendations from your trip",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(TravelHighlightsSchema),
      transforms: ["truncateText(4000)"],
      promptTemplate:
        "Extract highlights \u2192 {tripTitle, duration, topMoments[], bestPhoto, oneLiner, recommendations[]}",
    },
  },
  {
    recipe: travelBlogRecipe,
    label: "Blog Post",
    icon: "\u270D\uFE0F",
    description: "Write an engaging travel blog post with headers and tips",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate:
        "Write a travel blog post with title, sections, observations, and tips ...materials",
    },
  },
  {
    recipe: photoCaptionRecipe,
    label: "Photo Caption",
    icon: "\uD83D\uDCF8",
    description: "Generate captions and hashtags for travel photos",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(PhotoCaptionsSchema),
      transforms: [],
      promptTemplate:
        "Generate photo captions \u2192 {captions: [{description, shortCaption, instagramCaption, hashtags[], mood}]}",
    },
  },
  {
    recipe: tripSummaryRecipe,
    label: "Trip Report",
    icon: "\uD83D\uDCCB",
    description: "Compile a comprehensive trip summary with timeline and expenses",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(TripSummarySchema),
      transforms: ["truncateText(6000)", "dataToText()", "documentToText()"],
      promptTemplate:
        "Compile trip report \u2192 {title, overview, destinations[], timeline[], expenses, ratings, lessonsLearned[]}",
    },
  },
  {
    recipe: budgetAnalysisRecipe,
    label: "Budget",
    icon: "\uD83D\uDCB0",
    description: "Analyze travel expenses with breakdowns and saving tips",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(BudgetAnalysisSchema),
      transforms: ["dataToText()"],
      promptTemplate:
        "Analyze expenses \u2192 {summary, totalSpent, dailyAverage, categoryBreakdown[], mostExpensive, savingTips[], comparisonNotes}",
    },
  },
  {
    recipe: destinationGuideRecipe,
    label: "Guide",
    icon: "\uD83D\uDDFA\uFE0F",
    description: "Create a practical destination guide with local tips",
    meta: {
      outputType: "json",
      schemaFields: zodToFieldMeta(DestinationGuideSchema),
      transforms: ["truncateText(4000)", "documentToText()"],
      promptTemplate:
        "Create guide \u2192 {destination, bestSeason, mustSee[], localFood[], transportation[], culturalNotes[], packlist[]}",
    },
  },
];

// biome-ignore lint/suspicious/noExplicitAny: recipe output types vary
export const travelRecipeRegistry: Record<string, Recipe<MaterialPart[], any>> = Object.fromEntries(
  travelRecipeEntries.map((e) => [e.recipe.id, e.recipe]),
);
