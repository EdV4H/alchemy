import type { MaterialPart } from "@edv4h/alchemy-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    const material: MaterialPart[] = [{ type: "text", text: "Summarize this" }];
    const result = await transmuter.transmute(material, {
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
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

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
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([{ role: "user", content: "Hello" }]);
  });

  it("maps image URL material to OpenAI image_url content part", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "I see an image" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "Describe this image" },
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image" },
          { type: "image_url", image_url: { url: "https://example.com/img.png" } },
        ],
      },
    ]);
  });

  it("maps base64 image material to OpenAI data URI content part", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "I see a base64 image" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "What is this?" },
      { type: "image", source: { kind: "base64", mediaType: "image/png", data: "abc123" } },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "What is this?" },
          { type: "image_url", image_url: { url: "data:image/png;base64,abc123" } },
        ],
      },
    ]);
  });

  it("adds language system message when language is provided", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "こんにちは" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], { language: "Japanese" });

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      { role: "system", content: "Respond in Japanese." },
      { role: "user", content: "Hello" },
    ]);
  });

  it("adds language after roleDefinition when both are provided", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "こんにちは" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {
      catalyst: { roleDefinition: "You are a translator" },
      language: "Japanese",
    });

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      { role: "system", content: "You are a translator" },
      { role: "system", content: "Respond in Japanese." },
      { role: "user", content: "Hello" },
    ]);
  });

  it("joins multiple text parts with double newline for text-only input", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "combined" } }],
      usage: null,
    });

    const transmuter = new OpenAITransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "First part" },
      { type: "text", text: "Second part" },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([{ role: "user", content: "First part\n\nSecond part" }]);
  });
});
