import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCompare } from "../use-compare.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useCompare", () => {
  it("starts with idle state", () => {
    const { result } = renderHook(() => useCompare());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("compares successfully", async () => {
    const payload = { formal: "result A", casual: "result B" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useCompare());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.compare(
        "recipe-1",
        [{ type: "text", text: "hello" }],
        ["formal", "casual"],
      );
    });

    expect(returnValue).toEqual(payload);
    expect(result.current.data).toEqual(payload);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/compare/recipe-1",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("passes catalystKeys and language in body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useCompare());

    await act(async () => {
      await result.current.compare("r1", [{ type: "text", text: "hi" }], ["a", "b"], {
        language: "Japanese",
      });
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.catalystKeys).toEqual(["a", "b"]);
    expect(body.language).toBe("Japanese");
  });

  it("handles HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad Request"),
    });

    const { result } = renderHook(() => useCompare());

    await act(async () => {
      await result.current.compare("r1", [{ type: "text", text: "hi" }], ["a", "b"]);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("400");
    expect(result.current.data).toBeNull();
  });

  it("resets state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ a: "x" }),
    });

    const { result } = renderHook(() => useCompare());

    await act(async () => {
      await result.current.compare("r1", [{ type: "text", text: "hi" }], ["a"]);
    });
    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
