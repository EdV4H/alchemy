import type { MaterialPart, MaterialTransformContext } from "@edv4h/alchemy-core";
import { TransformError } from "@edv4h/alchemy-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { audioToText, imageUrlToBase64, videoToFrames } from "../transforms.js";

const ctx: MaterialTransformContext = { recipeId: "test" };

describe("imageUrlToBase64", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("converts image URL parts to base64", async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const mockResponse = {
      ok: true,
      arrayBuffer: () => Promise.resolve(pngBytes.buffer),
      headers: new Headers({ "content-type": "image/png" }),
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse as Response);

    const parts: MaterialPart[] = [
      { type: "image", source: { kind: "url", url: "https://example.com/img.png" } },
    ];

    const result = await imageUrlToBase64()(parts, ctx);

    expect(result).toEqual([
      {
        type: "image",
        source: {
          kind: "base64",
          mediaType: "image/png",
          data: Buffer.from(pngBytes).toString("base64"),
        },
      },
    ]);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://example.com/img.png");
  });

  it("leaves non-URL image parts unchanged", async () => {
    const parts: MaterialPart[] = [
      { type: "image", source: { kind: "base64", mediaType: "image/png", data: "abc123" } },
    ];

    const result = await imageUrlToBase64()(parts, ctx);
    expect(result).toEqual(parts);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("leaves text parts unchanged", async () => {
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];

    const result = await imageUrlToBase64()(parts, ctx);
    expect(result).toEqual(parts);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("throws on fetch failure", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const parts: MaterialPart[] = [
      { type: "image", source: { kind: "url", url: "https://example.com/missing.png" } },
    ];

    await expect(imageUrlToBase64()(parts, ctx)).rejects.toThrow(
      "Failed to fetch image: 404 Not Found",
    );
  });
});

describe("audioToText", () => {
  it("throws TransformError by default for audio parts", async () => {
    const parts: MaterialPart[] = [
      { type: "audio", source: { kind: "url", url: "https://example.com/audio.mp3" } },
    ];
    await expect(audioToText()(parts, ctx)).rejects.toThrow(TransformError);
  });

  it("returns placeholder text with stub: true", async () => {
    const parts: MaterialPart[] = [
      { type: "audio", source: { kind: "url", url: "https://example.com/audio.mp3" } },
    ];
    const result = await audioToText({ stub: true })(parts, ctx);
    expect(result).toEqual([{ type: "text", text: "[Audio transcription not available]" }]);
  });

  it("leaves non-audio parts unchanged", async () => {
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];
    const result = await audioToText()(parts, ctx);
    expect(result).toEqual(parts);
  });
});

describe("videoToFrames", () => {
  it("throws TransformError by default for video parts", async () => {
    const parts: MaterialPart[] = [
      { type: "video", source: { kind: "url", url: "https://example.com/video.mp4" } },
    ];
    await expect(videoToFrames()(parts, ctx)).rejects.toThrow(TransformError);
  });

  it("returns placeholder text with stub: true", async () => {
    const parts: MaterialPart[] = [
      { type: "video", source: { kind: "url", url: "https://example.com/video.mp4" } },
    ];
    const result = await videoToFrames({ stub: true })(parts, ctx);
    expect(result).toEqual([{ type: "text", text: "[Video frame extraction not available]" }]);
  });

  it("leaves non-video parts unchanged", async () => {
    const parts: MaterialPart[] = [{ type: "text", text: "hello" }];
    const result = await videoToFrames()(parts, ctx);
    expect(result).toEqual(parts);
  });
});
