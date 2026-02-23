import type { MaterialPart, MaterialTransformContext } from "@EdV4H/alchemy-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { imageUrlToBase64 } from "../transforms.js";

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
