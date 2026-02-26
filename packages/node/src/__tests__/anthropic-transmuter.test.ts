import type { MaterialPart } from "@EdV4H/alchemy-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreate = vi.fn();
const mockStream = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
        stream: mockStream,
      },
    })),
  };
});

import { AnthropicTransmuter } from "../transmuters/anthropic.js";

beforeEach(() => {
  mockCreate.mockReset();
  mockStream.mockReset();
});

describe("AnthropicTransmuter.transmute()", () => {
  it("sends messages and returns result", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "summary" }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
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
        system: "You are a summarizer",
        messages: [{ role: "user", content: "Summarize this" }],
        temperature: 0.3,
        max_tokens: 4096,
      }),
      expect.anything(),
    );
  });

  it("uses defaultModel when catalyst.model is absent", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "ok" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({
      apiKey: "test-key",
      defaultModel: "claude-haiku-4-5-20251001",
    });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-haiku-4-5-20251001" }),
      expect.anything(),
    );
  });

  it("sets system to undefined when roleDefinition and language are absent", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "hi" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toBeUndefined();
  });

  it("builds system from roleDefinition and language", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "こんにちは" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {
      catalyst: { roleDefinition: "You are a translator" },
      language: "Japanese",
    });

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toBe("You are a translator\nRespond in Japanese.");
  });

  it("maps base64 image material to Anthropic image content block", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "I see an image" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "Describe this image" },
      { type: "image", source: { kind: "base64", mediaType: "image/png", data: "abc123" } },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image" },
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: "abc123" },
          },
        ],
      },
    ]);
  });

  it("maps URL image material to Anthropic URL source", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "I see an image" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "Describe" },
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "Describe" },
          {
            type: "image",
            source: { type: "url", url: "https://example.com/img.png" },
          },
        ],
      },
    ]);
  });

  it("adds language to system when provided without roleDefinition", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "こんにちは" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], { language: "Japanese" });

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toBe("Respond in Japanese.");
  });

  it("joins multiple text parts with double newline for text-only input", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "combined" }],
      usage: null,
    });

    const transmuter = new AnthropicTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "First part" },
      { type: "text", text: "Second part" },
    ];
    await transmuter.transmute(material, {});

    const messages = mockCreate.mock.calls[0][0].messages;
    expect(messages).toEqual([{ role: "user", content: "First part\n\nSecond part" }]);
  });
});
