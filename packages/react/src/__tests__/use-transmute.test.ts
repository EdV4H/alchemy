import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTransmute } from "../use-transmute.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTransmute", () => {
  it("starts with idle state", () => {
    const { result } = renderHook(() => useTransmute());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("transmutes successfully", async () => {
    const payload = { text: "result" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useTransmute());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.transmute("recipe-1", [{ type: "text", text: "hello" }]);
    });

    expect(returnValue).toEqual(payload);
    expect(result.current.data).toEqual(payload);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/transmute/recipe-1",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("passes catalystKey and language in body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve("ok"),
    });

    const { result } = renderHook(() => useTransmute());

    await act(async () => {
      await result.current.transmute("r1", [{ type: "text", text: "hi" }], {
        catalystKey: "formal",
        language: "Japanese",
      });
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.catalystKey).toBe("formal");
    expect(body.language).toBe("Japanese");
  });

  it("handles HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const { result } = renderHook(() => useTransmute());

    await act(async () => {
      await result.current.transmute("recipe-1", [{ type: "text", text: "hello" }]);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("500");
    expect(result.current.data).toBeNull();
  });

  it("uses baseUrl when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve("ok"),
    });

    const { result } = renderHook(() => useTransmute({ baseUrl: "https://api.example.com" }));

    await act(async () => {
      await result.current.transmute("r1", [{ type: "text", text: "hi" }]);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/transmute/r1",
      expect.anything(),
    );
  });

  it("resets state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: "result" }),
    });

    const { result } = renderHook(() => useTransmute());

    await act(async () => {
      await result.current.transmute("r1", [{ type: "text", text: "hi" }]);
    });
    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
