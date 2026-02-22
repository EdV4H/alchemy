import { describe, expect, it } from "vitest";
import { extractText, isTextOnly, normalizeSpellOutput } from "../material.js";

describe("normalizeSpellOutput()", () => {
  it("wraps a string into a single TextMaterialPart", () => {
    expect(normalizeSpellOutput("hello")).toEqual([{ type: "text", text: "hello" }]);
  });

  it("wraps a single MaterialPart into an array", () => {
    const part = { type: "text" as const, text: "hi" };
    expect(normalizeSpellOutput(part)).toEqual([part]);
  });

  it("returns a MaterialPart[] as-is", () => {
    const parts = [
      { type: "text" as const, text: "hello" },
      {
        type: "image" as const,
        source: { kind: "url" as const, url: "https://example.com/img.png" },
      },
    ];
    expect(normalizeSpellOutput(parts)).toBe(parts);
  });

  it("wraps an ImageMaterialPart into an array", () => {
    const part = {
      type: "image" as const,
      source: { kind: "base64" as const, mediaType: "image/png", data: "abc123" },
    };
    expect(normalizeSpellOutput(part)).toEqual([part]);
  });
});

describe("extractText()", () => {
  it("extracts and joins text parts", () => {
    const parts = [
      { type: "text" as const, text: "hello" },
      {
        type: "image" as const,
        source: { kind: "url" as const, url: "https://example.com/img.png" },
      },
      { type: "text" as const, text: "world" },
    ];
    expect(extractText(parts)).toBe("hello\n\nworld");
  });

  it("returns empty string for no text parts", () => {
    const parts = [
      {
        type: "image" as const,
        source: { kind: "url" as const, url: "https://example.com/img.png" },
      },
    ];
    expect(extractText(parts)).toBe("");
  });

  it("returns single text part without separator", () => {
    expect(extractText([{ type: "text", text: "only" }])).toBe("only");
  });
});

describe("isTextOnly()", () => {
  it("returns true when all parts are text", () => {
    const parts = [
      { type: "text" as const, text: "a" },
      { type: "text" as const, text: "b" },
    ];
    expect(isTextOnly(parts)).toBe(true);
  });

  it("returns false when any part is not text", () => {
    const parts = [
      { type: "text" as const, text: "a" },
      {
        type: "image" as const,
        source: { kind: "url" as const, url: "https://example.com/img.png" },
      },
    ];
    expect(isTextOnly(parts)).toBe(false);
  });

  it("returns true for empty array", () => {
    expect(isTextOnly([])).toBe(true);
  });
});
