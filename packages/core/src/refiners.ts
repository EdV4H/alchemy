import { z } from "zod";
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

  private static describeType(t: z.ZodTypeAny): string {
    if (t instanceof z.ZodString) return "string";
    if (t instanceof z.ZodNumber) return "number";
    if (t instanceof z.ZodBoolean) return "boolean";
    if (t instanceof z.ZodEnum) return (t.options as string[]).map((o) => `"${o}"`).join(" | ");
    if (t instanceof z.ZodArray) return `${JsonRefiner.describeType(t.element)}[]`;
    if (t instanceof z.ZodObject) return JsonRefiner.describeObject(t);
    return "unknown";
  }

  private static describeObject(schema: z.ZodObject<z.ZodRawShape>): string {
    const entries = Object.entries(schema.shape).map(
      ([key, val]) => `"${key}": ${JsonRefiner.describeType(val as z.ZodTypeAny)}`,
    );
    return `{${entries.join(", ")}}`;
  }

  private describeSchema(): string | null {
    if (this.schema instanceof z.ZodObject) {
      return JsonRefiner.describeObject(this.schema as z.ZodObject<z.ZodRawShape>);
    }
    return null;
  }

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
    const desc = this.describeSchema();
    if (desc) {
      return `Respond with valid JSON matching this schema:\n${desc}\nNo markdown, no explanation.`;
    }
    return "Respond with valid JSON only. No markdown, no explanation.";
  }
}
