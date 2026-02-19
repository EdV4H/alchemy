import type { z } from "zod";
import type { Refiner } from "./types.js";

export class TextRefiner implements Refiner<string> {
  refine(rawText: string): string {
    return rawText.trim();
  }
}

export class JsonRefiner<T> implements Refiner<T> {
  constructor(private schema: z.ZodSchema<T>) {}

  refine(rawText: string): T {
    const parsed = JSON.parse(rawText);
    return this.schema.parse(parsed);
  }

  getFormatInstructions(): string {
    return "Respond with valid JSON only. No markdown, no explanation.";
  }
}
