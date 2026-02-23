import type { MaterialPart, SpellOutput } from "./types.js";

export function normalizeSpellOutput(output: SpellOutput): MaterialPart[] {
  if (typeof output === "string") {
    return [{ type: "text", text: output }];
  }
  if (Array.isArray(output)) {
    return output;
  }
  return [output];
}

export function extractText(parts: MaterialPart[]): string {
  return parts
    .filter((p): p is MaterialPart & { type: "text" } => p.type === "text")
    .map((p) => p.text)
    .join("\n\n");
}

export function isTextOnly(parts: MaterialPart[]): boolean {
  return parts.every((p) => p.type === "text");
}

export function extractAllText(parts: MaterialPart[]): string {
  return parts
    .map((p) => {
      if (p.type === "text") return p.text;
      if (p.type === "document" && p.source.kind === "text") return p.source.text;
      if (p.type === "data") return p.content;
      return null;
    })
    .filter(Boolean)
    .join("\n\n");
}
