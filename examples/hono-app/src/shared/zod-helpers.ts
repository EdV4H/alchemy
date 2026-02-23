import { z } from "zod";
import type { RecipeFieldMeta } from "./recipe-types.js";

export function describeZodType(t: z.ZodTypeAny): string {
  if (t instanceof z.ZodString) return "string";
  if (t instanceof z.ZodNumber) return "number";
  if (t instanceof z.ZodBoolean) return "boolean";
  if (t instanceof z.ZodEnum)
    return `enum(${(t.options as string[]).map((o) => `"${o}"`).join(" | ")})`;
  if (t instanceof z.ZodArray) return `${describeZodType(t.element)}[]`;
  if (t instanceof z.ZodObject) return "object";
  return "unknown";
}

export function zodToFieldMeta(schema: z.ZodObject<z.ZodRawShape>): RecipeFieldMeta[] {
  return Object.entries(schema.shape).map(([name, field]) => {
    const f = field as z.ZodTypeAny;
    const inner =
      f instanceof z.ZodArray && f.element instanceof z.ZodObject
        ? zodToFieldMeta(f.element as z.ZodObject<z.ZodRawShape>)
        : f instanceof z.ZodObject
          ? zodToFieldMeta(f as z.ZodObject<z.ZodRawShape>)
          : undefined;
    return { name, type: describeZodType(f), children: inner };
  });
}
