import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

import { OpenAITransmuter } from "../transmuters/openai.js";

beforeEach(() => {
  mockCreate.mockReset();
});

describe("OpenAITransmuter.transmute()", () => {
  it("sends messages and returns result", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "summary" } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    const result = await transmuter.transmute("Summarize this", {
      catalyst: { roleDefinition: "You are a summarizer", temperature: 0.3 },
    });

    expect(result.text).toBe("summary");
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: "system", content: "You are a summarizer" },
          { role: "user", content: "Summarize this" },
        ],
        temperature: 0.3,
      }),
      expect.anything(),
    );
  });

  it("uses defaultModel when catalyst.model is absent", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "ok" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({
      apiKey: "test-key",
      defaultModel: "gpt-4o",
    });
    await transmuter.transmute("Hello", {});

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-4o" }),
      expect.anything(),
    );
  });

  it("skips system message when roleDefinition is absent", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "hi" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    await transmuter.transmute("Hello", {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([{ role: "user", content: "Hello" }]);
  });
});
