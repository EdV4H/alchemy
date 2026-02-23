import type { z } from "zod";
import { RefineError } from "./errors.js";
import type { Refiner } from "./types.js";

export class TextRefiner implements Refiner<string> {
  refine(rawText: string): string {
    return rawText.trim();
  }

  getFormatInstructions(): string {
    return "Respond with plain text only. No JSON, no markdown formatting.";
  }
}

export class JsonRefiner<T> implements Refiner<T> {
  constructor(private schema: z.ZodSchema<T>) {}

  private static stripCodeFences(text: string): string {
    const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
    const match = fenceRegex.exec(text.trim());
    return match ? match[1].trim() : text.trim();
  }

  refine(rawText: string): T {
    try {
      const cleaned = JsonRefiner.stripCodeFences(rawText);
      const parsed = JSON.parse(cleaned);
      return this.schema.parse(parsed);
    } catch (e) {
      throw new RefineError("Failed to refine JSON output", { cause: e });
    }
  }

  getFormatInstructions(): string {
    return "Respond with valid JSON only. No markdown, no explanation.";
  }
}
