import { describe, expect, it } from "vitest";
import { filterByType, prependText, truncateText } from "../transforms.js";
import type { MaterialPart, MaterialTransformContext } from "../types.js";

const ctx: MaterialTransformContext = { recipeId: "test" };

describe("truncateText", () => {
  it("truncates text parts exceeding maxLength", () => {
    const parts: MaterialPart[] = [{ type: "text", text: "Hello, World!" }];
    const result = truncateText(5)(parts, ctx);
    expect(result).toEqual([{ type: "text", text: "Hello…" }]);
  });

  it("uses custom suffix", () => {
    const parts: MaterialPart[] = [{ type: "text", text: "Hello, World!" }];
    const result = truncateText(5, "...")(parts, ctx);
    expect(result).toEqual([{ type: "text", text: "Hello..." }]);
  });

  it("does not truncate text within limit", () => {
    const parts: MaterialPart[] = [{ type: "text", text: "Hi" }];
    const result = truncateText(10)(parts, ctx);
    expect(result).toEqual([{ type: "text", text: "Hi" }]);
  });

  it("leaves non-text parts unchanged", () => {
    const parts: MaterialPart[] = [
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ];
    const result = truncateText(5)(parts, ctx);
    expect(result).toEqual(parts);
  });
});

describe("prependText", () => {
  it("prepends a text part", () => {
    const parts: MaterialPart[] = [{ type: "text", text: "world" }];
    const result = prependText("hello")(parts, ctx);
    expect(result).toEqual([
      { type: "text", text: "hello" },
      { type: "text", text: "world" },
    ]);
  });

  it("works with empty parts array", () => {
    const result = prependText("only")([], ctx);
    expect(result).toEqual([{ type: "text", text: "only" }]);
  });
});

describe("filterByType", () => {
  const mixed: MaterialPart[] = [
    { type: "text", text: "hello" },
    { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    { type: "text", text: "world" },
  ];

  it("keeps only text parts", () => {
    const result = filterByType("text")(mixed, ctx);
    expect(result).toEqual([
      { type: "text", text: "hello" },
      { type: "text", text: "world" },
    ]);
  });

  it("keeps only image parts", () => {
    const result = filterByType("image")(mixed, ctx);
    expect(result).toEqual([
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ]);
  });

  it("keeps multiple types", () => {
    const result = filterByType("text", "image")(mixed, ctx);
    expect(result).toEqual(mixed);
  });

  it("returns empty for no matching types", () => {
    const result = filterByType("image")([{ type: "text", text: "only text" }], ctx);
    expect(result).toEqual([]);
  });
});
