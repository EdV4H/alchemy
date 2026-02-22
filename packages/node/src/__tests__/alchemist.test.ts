import { describe, it, expect, vi } from "vitest";
import { Alchemist } from "../index.js";
import { TextRefiner, JsonRefiner } from "@EdV4H/alchemy-core";
import { z } from "zod";
import type {
  Transmuter,
  TransmutationResult,
} from "@EdV4H/alchemy-core";

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
      "Summarize: long text",
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

    const prompt = (transmuter.transmute as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(prompt).toContain("Extract: some text");
    expect(prompt).toContain("JSON");
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
      "Hello",
      expect.objectContaining({
        catalyst: { roleDefinition: "You are helpful", temperature: 0.5 },
      }),
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
