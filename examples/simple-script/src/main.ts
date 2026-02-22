import type { MaterialPart, Refiner, TextMaterialPart } from "@EdV4H/alchemy-node";
import { Alchemist, JsonRefiner, OpenAITransmuter, TextRefiner } from "@EdV4H/alchemy-node";
import { z } from "zod";

// ─── Setup ───────────────────────────────────────────────────────────────────

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// Example 1: Hello Alchemy — Minimal Recipe (no catalyst)
// Demo: catalyst 省略で最小構成、string spell → TextRefiner
// ═══════════════════════════════════════════════════════════════════════════════

const helloRecipe = {
  id: "hello",
  spell: (topic: string) => `Tell me one fun fact about: ${topic}`,
  refiner: new TextRefiner(),
};

console.log("--- Example 1: Hello Alchemy (minimal recipe, no catalyst) ---");
const funFact = await alchemist.transmute(helloRecipe, "alchemy");
console.log("Fun fact:", funFact);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// Example 2: Profile Extraction — JsonRefiner + Zod + roleDefinition
// Demo: JsonRefiner で Zod スキーマバリデーション、format instructions 自動付与
// ═══════════════════════════════════════════════════════════════════════════════

const ProfileSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  experienceYears: z.number(),
  level: z.enum(["Junior", "Mid", "Senior"]),
});

type Profile = z.infer<typeof ProfileSchema>;

const profileRecipe = {
  id: "profile-extraction",
  catalyst: {
    roleDefinition:
      "You are a data extraction specialist. Extract structured information accurately from resume text.",
    temperature: 0,
  },
  spell: (text: string) => `Extract the person's profile from this resume:\n\n${text}`,
  refiner: new JsonRefiner(ProfileSchema),
};

const resumeText = `
  Jane Smith is a Senior Software Engineer with 8 years of experience.
  Her key skills include TypeScript, React, Node.js, and PostgreSQL.
`;

console.log("--- Example 2: Profile Extraction (JsonRefiner + Zod) ---");
const profile: Profile = await alchemist.transmute(profileRecipe, resumeText);
console.log("Extracted:", JSON.stringify(profile, null, 2));
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// Example 3: Multi-Perspective Analysis — async spell + MaterialPart[] 合成
// Demo: spell が Promise<MaterialPart[]> を返す、複数 TextMaterialPart の合成
// ═══════════════════════════════════════════════════════════════════════════════

const perspectives = ["economic impact", "environmental impact", "social impact"];

const multiPerspectiveRecipe = {
  id: "multi-perspective",
  catalyst: {
    roleDefinition:
      "You are an analytical synthesizer. Combine multiple perspectives into a balanced summary.",
    temperature: 0.4,
  },
  spell: async (topic: string): Promise<MaterialPart[]> => {
    // Build multiple TextMaterialParts — each representing a different analysis angle
    const parts: TextMaterialPart[] = perspectives.map((perspective) => ({
      type: "text" as const,
      text: `[${perspective.toUpperCase()}]: Analyze "${topic}" from the perspective of ${perspective}.`,
    }));

    parts.push({
      type: "text" as const,
      text: "Now synthesize all the above perspectives into a single balanced paragraph.",
    });

    return parts;
  },
  refiner: new TextRefiner(),
};

console.log("--- Example 3: Multi-Perspective Analysis (async spell + MaterialPart[]) ---");
const synthesis = await alchemist.transmute(multiPerspectiveRecipe, "remote work");
console.log("Synthesis:", synthesis);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// Example 4: Creative Story — Streaming + Custom Refiner
// Demo: alchemist.stream() でリアルタイム出力、Refiner<T> の独自実装
// ═══════════════════════════════════════════════════════════════════════════════

// Custom Refiner that parses "# Title\n\nBody..." format
interface Story {
  title: string;
  body: string;
}

class StoryRefiner implements Refiner<Story> {
  getFormatInstructions(): string {
    return 'Write the story with a title on the first line prefixed by "# ", followed by a blank line and the story body.';
  }

  refine(rawText: string): Story {
    const trimmed = rawText.trim();
    const lines = trimmed.split("\n");
    const titleLine = lines[0] ?? "";
    const title = titleLine.replace(/^#\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    return { title: title || "Untitled", body: body || trimmed };
  }
}

const storyRecipe = {
  id: "creative-story",
  catalyst: {
    roleDefinition: "You are a creative storyteller. Write short, vivid stories.",
    temperature: 0.9,
  },
  spell: (topic: string) => `Write a very short story (3-4 sentences) about: ${topic}`,
  refiner: new StoryRefiner(),
};

console.log("--- Example 4: Creative Story (streaming + custom Refiner) ---");

// First, stream raw output in real-time
process.stdout.write("Streaming: ");
for await (const chunk of alchemist.stream(storyRecipe, "a robot learning to paint")) {
  process.stdout.write(chunk);
}
console.log("\n");

// Then, transmute with the same recipe to get the parsed Story object
const story: Story = await alchemist.transmute(storyRecipe, "a robot learning to paint");
console.log("Parsed title:", story.title);
console.log("Parsed body:", story.body);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// Example 5: Image Q&A — Image input + complex TInput + model override + JSON
// Demo: Image URL MaterialPart、Recipe<ComparisonInput, T>、model: "gpt-4o"
// ═══════════════════════════════════════════════════════════════════════════════

interface ImageQAInput {
  imageUrl: string;
  question: string;
}

const ImageAnswerSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  details: z.array(z.string()),
});

type ImageAnswer = z.infer<typeof ImageAnswerSchema>;

const imageQARecipe = {
  id: "image-qa",
  catalyst: {
    roleDefinition: "You are an image analysis expert. Answer questions about images precisely.",
    temperature: 0.2,
    model: "gpt-4o",
  },
  spell: (input: ImageQAInput): MaterialPart[] => [
    { type: "text", text: `Question: ${input.question}` },
    { type: "image", source: { kind: "url" as const, url: input.imageUrl } },
  ],
  refiner: new JsonRefiner(ImageAnswerSchema),
};

console.log("--- Example 5: Image Q&A (image + complex input + model override) ---");
const imageAnswer: ImageAnswer = await alchemist.transmute(imageQARecipe, {
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/300px-PNG_transparency_demonstration_1.png",
  question: "What objects and colors do you see in this image?",
});
console.log("Answer:", JSON.stringify(imageAnswer, null, 2));
console.log();
