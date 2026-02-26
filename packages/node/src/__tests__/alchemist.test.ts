import type {
  MaterialPart,
  MaterialTransform,
  TransmutationResult,
  Transmuter,
} from "@edv4h/alchemy-core";
import { JsonRefiner, TextRefiner } from "@edv4h/alchemy-core";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Alchemist } from "../index.js";

function mockTransmuter(responseText: string): Transmuter {
  return {
    transmute: vi.fn().mockResolvedValue({
      text: responseText,
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    } satisfies TransmutationResult),
  };
}

describe("Alchemist.transmute()", () => {
  it("orchestrates spell → transmuter → refiner", async () => {
    const transmuter = mockTransmuter("  hello  ");
    const alchemist = new Alchemist({ transmuter });

    const result = await alchemist.transmute(
      {
        id: "test",
        spell: (input: string) => `Summarize: ${input}`,
        refiner: new TextRefiner(),
      },
      "long text",
    );

    expect(result).toBe("hello");
    expect(transmuter.transmute).toHaveBeenCalledWith(
      [
        { type: "text", text: "Summarize: long text" },
        { type: "text", text: "Respond with plain text only. No JSON, no markdown formatting." },
      ],
      expect.objectContaining({ catalyst: undefined }),
    );
  });

  it("appends format instructions from refiner", async () => {
    const schema = z.object({ value: z.string() });
    const transmuter = mockTransmuter('{"value":"test"}');
    const alchemist = new Alchemist({ transmuter });

    await alchemist.transmute(
      {
        id: "json-test",
        spell: (input: string) => `Extract: ${input}`,
        refiner: new JsonRefiner(schema),
      },
      "some text",
    );

    const parts = (transmuter.transmute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as MaterialPart[];
    expect(parts[0]).toEqual({ type: "text", text: "Extract: some text" });
    expect(parts.length).toBe(2);
    expect(parts[1]).toHaveProperty("type", "text");
    expect((parts[1] as { type: "text"; text: string }).text).toContain("JSON");
  });

  it("passes catalyst to transmuter", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    await alchemist.transmute(
      {
        id: "catalyst-test",
        catalyst: {
          roleDefinition: "You are helpful",
          temperature: 0.5,
        },
        spell: () => "Hello",
        refiner: new TextRefiner(),
      },
      undefined,
    );

    expect(transmuter.transmute).toHaveBeenCalledWith(
      expect.arrayContaining([{ type: "text", text: "Hello" }]),
      expect.objectContaining({
        catalyst: { roleDefinition: "You are helpful", temperature: 0.5 },
      }),
    );
  });

  it("passes language option through to transmuter", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    await alchemist.transmute(
      {
        id: "language-test",
        spell: () => "Hello",
        refiner: new TextRefiner(),
      },
      undefined,
      { language: "Japanese" },
    );

    expect(transmuter.transmute).toHaveBeenCalledWith(
      expect.arrayContaining([{ type: "text", text: "Hello" }]),
      expect.objectContaining({ language: "Japanese" }),
    );
  });
});

describe("Alchemist.stream()", () => {
  it("yields chunks from transmuter", async () => {
    async function* fakeStream(): AsyncGenerator<string> {
      yield "Hello";
      yield " ";
      yield "world";
    }

    const transmuter: Transmuter = {
      transmute: vi.fn(),
      stream: vi.fn().mockImplementation(fakeStream),
    };
    const alchemist = new Alchemist({ transmuter });

    const chunks: string[] = [];
    for await (const chunk of alchemist.stream(
      {
        id: "stream-test",
        spell: (input: string) => `Stream: ${input}`,
        refiner: new TextRefiner(),
      },
      "test",
    )) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Hello", " ", "world"]);
    expect(transmuter.stream).toHaveBeenCalledWith(
      [{ type: "text", text: "Stream: test" }],
      expect.objectContaining({ catalyst: undefined }),
    );
  });

  it("throws when transmuter has no stream method", async () => {
    const transmuter: Transmuter = { transmute: vi.fn() };
    const alchemist = new Alchemist({ transmuter });

    const gen = alchemist.stream(
      { id: "no-stream", spell: () => "test", refiner: new TextRefiner() },
      undefined,
    );
    await expect(gen.next()).rejects.toThrow("does not support streaming");
  });
});

describe("Alchemist.compare()", () => {
  it("returns results from multiple catalysts", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    const results = await alchemist.compare(
      {
        id: "compare-test",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      { a: { temperature: 0.3 }, b: { temperature: 0.9 } },
    );

    expect(results).toHaveProperty("a", "result");
    expect(results).toHaveProperty("b", "result");
  });

  it("returns partial results when one catalyst fails", async () => {
    let callCount = 0;
    const transmuter: Transmuter = {
      transmute: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 2) throw new Error("API failure");
        return { text: "  ok  ", usage: undefined };
      }),
    };
    const alchemist = new Alchemist({ transmuter });

    const results = await alchemist.compare(
      {
        id: "partial-test",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      { a: { temperature: 0.3 }, b: { temperature: 0.9 } },
    );

    expect(results.a).toBe("ok");
    expect(results.b).toEqual({ error: expect.any(Error) });
    expect((results.b as { error: Error }).error.message).toBe("API failure");
  });
});

describe("MaterialTransform pipeline", () => {
  it("applies global transforms then recipe transforms in order", async () => {
    const transmuter = mockTransmuter("done");
    const order: string[] = [];

    const globalTransform: MaterialTransform = (parts) => {
      order.push("global");
      return parts;
    };
    const recipeTransform: MaterialTransform = (parts) => {
      order.push("recipe");
      return parts;
    };

    const alchemist = new Alchemist({ transmuter, transforms: [globalTransform] });

    await alchemist.transmute(
      {
        id: "transform-test",
        spell: () => "input",
        refiner: new TextRefiner(),
        transforms: [recipeTransform],
      },
      undefined,
    );

    expect(order).toEqual(["global", "recipe"]);
  });

  it("passes transform context with recipeId and catalyst", async () => {
    const transmuter = mockTransmuter("done");
    const receivedCtx: unknown[] = [];

    const transform: MaterialTransform = (parts, ctx) => {
      receivedCtx.push(ctx);
      return parts;
    };

    const alchemist = new Alchemist({ transmuter, transforms: [transform] });

    await alchemist.transmute(
      {
        id: "ctx-test",
        catalyst: { temperature: 0.7 },
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
    );

    expect(receivedCtx[0]).toEqual({
      recipeId: "ctx-test",
      catalyst: { temperature: 0.7 },
    });
  });

  it("transforms modify parts before transmuter receives them", async () => {
    const transmuter = mockTransmuter("result");
    const prepend: MaterialTransform = (parts) => [{ type: "text", text: "PREFIX: " }, ...parts];

    const alchemist = new Alchemist({ transmuter, transforms: [prepend] });

    await alchemist.transmute(
      {
        id: "modify-test",
        spell: () => "original",
        refiner: new TextRefiner(),
      },
      undefined,
    );

    const parts = (transmuter.transmute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as MaterialPart[];
    expect(parts[0]).toEqual({ type: "text", text: "PREFIX: " });
    expect(parts[1]).toEqual({ type: "text", text: "original" });
  });

  it("supports async transforms", async () => {
    const transmuter = mockTransmuter("result");
    const asyncTransform: MaterialTransform = async (parts) => {
      await new Promise((r) => setTimeout(r, 1));
      return [...parts, { type: "text" as const, text: "async-added" }];
    };

    const alchemist = new Alchemist({ transmuter, transforms: [asyncTransform] });

    await alchemist.transmute(
      {
        id: "async-test",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
    );

    const parts = (transmuter.transmute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as MaterialPart[];
    expect(parts.some((p) => p.type === "text" && p.text === "async-added")).toBe(true);
  });

  it("skips transforms when none are configured", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    await alchemist.transmute(
      {
        id: "no-transform",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
    );

    const parts = (transmuter.transmute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as MaterialPart[];
    expect(parts[0]).toEqual({ type: "text", text: "input" });
  });

  it("applies transforms in stream() as well", async () => {
    async function* fakeStream(): AsyncGenerator<string> {
      yield "chunk";
    }

    const transmuter: Transmuter = {
      transmute: vi.fn(),
      stream: vi.fn().mockImplementation(fakeStream),
    };

    const transform: MaterialTransform = (parts) => [
      { type: "text" as const, text: "STREAM-PREFIX" },
      ...parts,
    ];

    const alchemist = new Alchemist({ transmuter, transforms: [transform] });

    const chunks: string[] = [];
    for await (const chunk of alchemist.stream(
      {
        id: "stream-transform",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
    )) {
      chunks.push(chunk);
    }

    const parts = (transmuter.stream as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as MaterialPart[];
    expect(parts[0]).toEqual({ type: "text", text: "STREAM-PREFIX" });
  });
});
