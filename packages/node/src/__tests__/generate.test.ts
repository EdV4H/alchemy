import type { TransmutationResult, Transmuter } from "@edv4h/alchemy-core";
import { TextRefiner } from "@edv4h/alchemy-core";
import { describe, expect, it, vi } from "vitest";
import { Alchemist } from "../index.js";

function mockTransmuter(responseText: string): Transmuter {
  return {
    transmute: vi.fn().mockResolvedValue({
      text: responseText,
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    } satisfies TransmutationResult),
  };
}

describe("Alchemist.generate()", () => {
  it("generates N variations with the same recipe and catalyst", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    const results = await alchemist.generate(
      {
        id: "gen-test",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      3,
    );

    expect(Object.keys(results)).toEqual(["variation-1", "variation-2", "variation-3"]);
    expect(results["variation-1"]).toBe("result");
    expect(results["variation-2"]).toBe("result");
    expect(results["variation-3"]).toBe("result");
    expect(transmuter.transmute).toHaveBeenCalledTimes(3);
  });

  it("passes catalyst to all variations", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    await alchemist.generate(
      {
        id: "gen-catalyst",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      2,
      { catalyst: { temperature: 0.8 } },
    );

    for (const call of (transmuter.transmute as ReturnType<typeof vi.fn>).mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({ catalyst: { temperature: 0.8 } }));
    }
  });

  it("returns partial results when some variations fail", async () => {
    let callCount = 0;
    const transmuter: Transmuter = {
      transmute: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 2) throw new Error("API failure");
        return { text: "  ok  ", usage: undefined };
      }),
    };
    const alchemist = new Alchemist({ transmuter });

    const results = await alchemist.generate(
      {
        id: "gen-partial",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      3,
    );

    expect(results["variation-1"]).toBe("ok");
    expect(results["variation-2"]).toEqual({ error: expect.any(Error) });
    expect((results["variation-2"] as { error: Error }).error.message).toBe("API failure");
    expect(results["variation-3"]).toBe("ok");
  });

  it("throws when count is less than 1", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    await expect(
      alchemist.generate(
        { id: "gen-invalid", spell: () => "input", refiner: new TextRefiner() },
        undefined,
        0,
      ),
    ).rejects.toThrow("count must be at least 1");
  });

  it("generates a single variation when count is 1", async () => {
    const transmuter = mockTransmuter("result");
    const alchemist = new Alchemist({ transmuter });

    const results = await alchemist.generate(
      {
        id: "gen-one",
        spell: () => "input",
        refiner: new TextRefiner(),
      },
      undefined,
      1,
    );

    expect(Object.keys(results)).toEqual(["variation-1"]);
    expect(results["variation-1"]).toBe("result");
  });
});
