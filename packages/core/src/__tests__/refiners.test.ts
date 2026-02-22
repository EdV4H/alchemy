import { describe, expect, it } from "vitest";
import { z } from "zod";
import { JsonRefiner, TextRefiner } from "../refiners.js";

describe("TextRefiner", () => {
  const refiner = new TextRefiner();

  it("trims whitespace", () => {
    expect(refiner.refine("  hello world  ")).toBe("hello world");
  });

  it("returns empty string unchanged", () => {
    expect(refiner.refine("")).toBe("");
  });

  it("preserves content without extra whitespace", () => {
    expect(refiner.refine("no whitespace")).toBe("no whitespace");
  });
});

describe("JsonRefiner", () => {
  const schema = z.object({ name: z.string(), age: z.number() });
  const refiner = new JsonRefiner(schema);

  it("parses valid JSON", () => {
    expect(refiner.refine('{"name":"Alice","age":30}')).toEqual({
      name: "Alice",
      age: 30,
    });
  });

  it("strips ```json code fences", () => {
    const fenced = '```json\n{"name":"Bob","age":25}\n```';
    expect(refiner.refine(fenced)).toEqual({ name: "Bob", age: 25 });
  });

  it("strips plain ``` code fences", () => {
    const fenced = '```\n{"name":"Carol","age":40}\n```';
    expect(refiner.refine(fenced)).toEqual({ name: "Carol", age: 40 });
  });

  it("throws ZodError for invalid schema", () => {
    expect(() => refiner.refine('{"name":"Dave"}')).toThrow();
  });

  it("throws SyntaxError for malformed JSON", () => {
    expect(() => refiner.refine("not-json")).toThrow(SyntaxError);
  });

  it("returns format instructions", () => {
    expect(refiner.getFormatInstructions()).toContain("JSON");
  });
});
