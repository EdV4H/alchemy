import {
  Alchemist,
  OpenAITransmuter,
  TextRefiner,
  JsonRefiner,
} from "@EdV4H/alchemy-node";
import { z } from "zod";

// ─── Setup ───────────────────────────────────────────────────────────────────

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
});

// ─── Example 1: Text Summarization ───────────────────────────────────────────

const summaryRecipe = {
  id: "summarize",
  catalyst: {
    roleDefinition: "You are a concise summarizer. Reply in 2-3 sentences.",
    temperature: 0.3,
  },
  spell: (text: string) => `Summarize the following text:\n\n${text}`,
  refiner: new TextRefiner(),
};

const articleText = `
  TypeScript is a strongly typed programming language that builds on JavaScript,
  giving you better tooling at any scale. It was developed by Microsoft and first
  released in 2012. TypeScript adds optional static typing and class-based
  object-oriented programming to the language.
`;

console.log("--- Example 1: Text Summarization ---");
const summary = await alchemist.transmute(summaryRecipe, articleText);
console.log("Summary:", summary);
console.log();

// ─── Example 2: Structured Data Extraction ───────────────────────────────────

const PersonSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  experienceYears: z.number(),
  level: z.enum(["Junior", "Mid", "Senior"]),
});

type Person = z.infer<typeof PersonSchema>;

const extractionRecipe = {
  id: "extract-person",
  catalyst: {
    roleDefinition:
      "You are a data extraction specialist. Extract structured information accurately.",
    temperature: 0,
  },
  spell: (resumeText: string) =>
    `Extract the person's information from this resume text:\n\n${resumeText}`,
  refiner: new JsonRefiner(PersonSchema),
};

const resumeText = `
  Jane Smith is a Senior Software Engineer with 8 years of experience.
  Her key skills include TypeScript, React, Node.js, and PostgreSQL.
`;

console.log("--- Example 2: Structured Data Extraction ---");
const person: Person = await alchemist.transmute(extractionRecipe, resumeText);
console.log("Extracted:", JSON.stringify(person, null, 2));
console.log();

// ─── Example 3: Streaming ────────────────────────────────────────────────────

const streamRecipe = {
  id: "stream-story",
  catalyst: {
    roleDefinition: "You are a creative writer.",
    temperature: 0.8,
  },
  spell: (topic: string) => `Write a 3-sentence story about: ${topic}`,
  refiner: new TextRefiner(),
};

console.log("--- Example 3: Streaming ---");
process.stdout.write("Story: ");
for await (const chunk of alchemist.stream(streamRecipe, "a curious cat")) {
  process.stdout.write(chunk);
}
console.log("\n");
