import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAlchemy } from "../use-alchemy.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAlchemy", () => {
  it("initializes with provided recipe ID", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));
    expect(result.current.selectedRecipeId).toBe("recipe-1");
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
  });

  it("selectRecipe resets state", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.setGenerateMode(true);
    });
    expect(result.current.generateMode).toBe(true);

    act(() => {
      result.current.selectRecipe("recipe-2");
    });

    expect(result.current.selectedRecipeId).toBe("recipe-2");
    expect(result.current.generateMode).toBe(false);
  });

  it("toggleMaterial adds and removes IDs", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.toggleMaterial("mat-1");
    });
    expect(result.current.selectedIds.has("mat-1")).toBe(true);

    act(() => {
      result.current.toggleMaterial("mat-1");
    });
    expect(result.current.selectedIds.has("mat-1")).toBe(false);
  });

  it("clearSelection empties selected IDs", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.toggleMaterial("mat-1");
      result.current.toggleMaterial("mat-2");
    });
    expect(result.current.selectedIds.size).toBe(2);

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("transmute calls fetch and sets result", async () => {
    const payload = { text: "output" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.setLanguage("Japanese");
    });

    await act(async () => {
      await result.current.transmute([{ type: "text", text: "hello" }]);
    });

    expect(result.current.result).toEqual(payload);
    expect(result.current.isLoading).toBe(false);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.language).toBe("Japanese");
    expect(mockFetch).toHaveBeenCalledWith("/api/transmute/recipe-1", expect.anything());
  });

  it("resetResults clears results and errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: "output" }),
    });

    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    await act(async () => {
      await result.current.transmute([{ type: "text", text: "hi" }]);
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.resetResults();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("setGenerateCount clamps to 2-5 range", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.setGenerateCount(1);
    });
    expect(result.current.generateCount).toBe(2);

    act(() => {
      result.current.setGenerateCount(10);
    });
    expect(result.current.generateCount).toBe(5);

    act(() => {
      result.current.setGenerateCount(3);
    });
    expect(result.current.generateCount).toBe(3);
  });

  it("generate calls fetch with correct endpoint and count", async () => {
    const payload = { "variation-1": "a", "variation-2": "b", "variation-3": "c" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.setGenerateMode(true);
      result.current.setGenerateCount(3);
    });

    await act(async () => {
      await result.current.generate([{ type: "text", text: "hello" }]);
    });

    expect(result.current.generateResults).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith("/api/generate/recipe-1", expect.anything());
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.count).toBe(3);
  });

  it("selectRecipe resets generateMode", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.setGenerateMode(true);
    });
    expect(result.current.generateMode).toBe(true);

    act(() => {
      result.current.selectRecipe("r2");
    });
    expect(result.current.generateMode).toBe(false);
  });
});
