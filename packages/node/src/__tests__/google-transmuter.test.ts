import type { MaterialPart } from "@edv4h/alchemy-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockGetGenerativeModel = vi.fn();

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

import { GoogleTransmuter } from "../transmuters/google.js";

beforeEach(() => {
  mockGenerateContent.mockReset();
  mockGenerateContentStream.mockReset();
  mockGetGenerativeModel.mockReset();

  mockGetGenerativeModel.mockReturnValue({
    generateContent: mockGenerateContent,
    generateContentStream: mockGenerateContentStream,
  });
});

describe("GoogleTransmuter.transmute()", () => {
  it("sends contents and returns result", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "summary",
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
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
    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        systemInstruction: "You are a summarizer",
        generationConfig: { temperature: 0.3 },
      }),
    );
    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [{ role: "user", parts: [{ text: "Summarize this" }] }],
    });
  });

  it("uses defaultModel when catalyst.model is absent", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "ok",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({
      apiKey: "test-key",
      defaultModel: "gemini-1.5-pro",
    });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-1.5-pro" }),
    );
  });

  it("sets systemInstruction to undefined when roleDefinition and language are absent", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "hi",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {});

    const callArgs = mockGetGenerativeModel.mock.calls[0][0];
    expect(callArgs.systemInstruction).toBeUndefined();
  });

  it("builds systemInstruction from roleDefinition and language", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "こんにちは",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
    await transmuter.transmute([{ type: "text", text: "Hello" }], {
      catalyst: { roleDefinition: "You are a translator" },
      language: "Japanese",
    });

    const callArgs = mockGetGenerativeModel.mock.calls[0][0];
    expect(callArgs.systemInstruction).toBe("You are a translator\nRespond in Japanese.");
  });

  it("maps base64 image material to inlineData format", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "I see an image",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "Describe this image" },
      { type: "image", source: { kind: "base64", mediaType: "image/png", data: "abc123" } },
    ];
    await transmuter.transmute(material, {});

    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Describe this image" },
            { inlineData: { mimeType: "image/png", data: "abc123" } },
          ],
        },
      ],
    });
  });

  it("maps URL image to text fallback with recommendation", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "I see an image",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "Describe" },
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ];
    await transmuter.transmute(material, {});

    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Describe" },
            {
              text: "[Image URL: https://example.com/img.png] (Use imageUrlToBase64() transform for inline image support)",
            },
          ],
        },
      ],
    });
  });

  it("joins multiple text parts with double newline for text-only input", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "combined",
        usageMetadata: null,
      },
    });

    const transmuter = new GoogleTransmuter({ apiKey: "test-key" });
    const material: MaterialPart[] = [
      { type: "text", text: "First part" },
      { type: "text", text: "Second part" },
    ];
    await transmuter.transmute(material, {});

    expect(mockGenerateContent).toHaveBeenCalledWith({
      contents: [{ role: "user", parts: [{ text: "First part\n\nSecond part" }] }],
    });
  });
});
