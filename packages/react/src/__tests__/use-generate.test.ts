import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGenerate } from "../use-generate.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useGenerate", () => {
  it("starts with idle state", () => {
    const { result } = renderHook(() => useGenerate());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("generates successfully", async () => {
    const payload = { "variation-1": "result A", "variation-2": "result B" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useGenerate());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.generate("recipe-1", [{ type: "text", text: "hello" }], 2);
    });

    expect(returnValue).toEqual(payload);
    expect(result.current.data).toEqual(payload);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/generate/recipe-1",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("passes count and language in body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useGenerate());

    await act(async () => {
      await result.current.generate("r1", [{ type: "text", text: "hi" }], 3, {
        language: "Japanese",
      });
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.count).toBe(3);
    expect(body.language).toBe("Japanese");
  });

  it("handles HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad Request"),
    });

    const { result } = renderHook(() => useGenerate());

    await act(async () => {
      await result.current.generate("r1", [{ type: "text", text: "hi" }], 2);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("400");
    expect(result.current.data).toBeNull();
  });

  it("resets state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ "variation-1": "x" }),
    });

    const { result } = renderHook(() => useGenerate());

    await act(async () => {
      await result.current.generate("r1", [{ type: "text", text: "hi" }], 1);
    });
    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("uses baseUrl option", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useGenerate({ baseUrl: "https://api.example.com" }));

    await act(async () => {
      await result.current.generate("r1", [{ type: "text", text: "hi" }], 2);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/generate/r1",
      expect.anything(),
    );
  });
});
