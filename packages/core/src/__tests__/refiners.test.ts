import { describe, expect, it } from "vitest";
import { z } from "zod";
import { RefineError } from "../errors.js";
import { JsonRefiner, MermaidRefiner, TextRefiner } from "../refiners.js";

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

  it("throws RefineError for invalid schema", () => {
    expect(() => refiner.refine('{"name":"Dave"}')).toThrow(RefineError);
  });

  it("throws RefineError for malformed JSON", () => {
    expect(() => refiner.refine("not-json")).toThrow(RefineError);
  });

  it("returns format instructions", () => {
    expect(refiner.getFormatInstructions()).toContain("JSON");
  });
});

describe("MermaidRefiner", () => {
  const refiner = new MermaidRefiner();

  it("parses a valid flowchart", () => {
    const diagram = "flowchart LR\n  A --> B --> C";
    expect(refiner.refine(diagram)).toBe(diagram);
  });

  it("strips ```mermaid code fences", () => {
    const fenced = "```mermaid\nflowchart TD\n  A --> B\n```";
    expect(refiner.refine(fenced)).toBe("flowchart TD\n  A --> B");
  });

  it("strips plain ``` code fences", () => {
    const fenced = "```\ngraph LR\n  A --> B\n```";
    expect(refiner.refine(fenced)).toBe("graph LR\n  A --> B");
  });

  it("throws RefineError for non-Mermaid text", () => {
    expect(() => refiner.refine("Hello world")).toThrow(RefineError);
  });

  it("throws RefineError for empty input", () => {
    expect(() => refiner.refine("")).toThrow(RefineError);
    expect(() => refiner.refine("   ")).toThrow(RefineError);
  });

  it("returns format instructions containing Mermaid", () => {
    expect(refiner.getFormatInstructions()).toContain("Mermaid");
  });

  it("accepts sequenceDiagram keyword", () => {
    const diagram = "sequenceDiagram\n  Alice->>Bob: Hello";
    expect(refiner.refine(diagram)).toBe(diagram);
  });

  it("accepts graph keyword", () => {
    const diagram = "graph TD\n  A --> B";
    expect(refiner.refine(diagram)).toBe(diagram);
  });
});
