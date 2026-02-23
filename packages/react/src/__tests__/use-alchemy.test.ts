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
    expect(result.current.compareResults).toBeNull();
  });

  it("selectRecipe resets catalyst and compare state", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.selectCatalyst("formal");
      result.current.setCompareMode(true);
      result.current.setCompareKeys(["a", "b"]);
    });

    expect(result.current.selectedCatalystKey).toBe("formal");
    expect(result.current.compareMode).toBe(true);

    act(() => {
      result.current.selectRecipe("recipe-2");
    });

    expect(result.current.selectedRecipeId).toBe("recipe-2");
    expect(result.current.selectedCatalystKey).toBeNull();
    expect(result.current.compareMode).toBe(false);
    expect(result.current.selectedCompareKeys).toEqual([]);
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

  it("toggleCompareKey toggles keys in compare list", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.toggleCompareKey("formal");
    });
    expect(result.current.selectedCompareKeys).toEqual(["formal"]);

    act(() => {
      result.current.toggleCompareKey("casual");
    });
    expect(result.current.selectedCompareKeys).toEqual(["formal", "casual"]);

    act(() => {
      result.current.toggleCompareKey("formal");
    });
    expect(result.current.selectedCompareKeys).toEqual(["casual"]);
  });

  it("setCompareMode(false) clears compare keys", () => {
    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "r1" }));

    act(() => {
      result.current.setCompareMode(true);
      result.current.setCompareKeys(["a", "b"]);
    });
    expect(result.current.selectedCompareKeys).toEqual(["a", "b"]);

    act(() => {
      result.current.setCompareMode(false);
    });
    expect(result.current.compareMode).toBe(false);
    expect(result.current.selectedCompareKeys).toEqual([]);
  });

  it("transmute calls fetch and sets result", async () => {
    const payload = { text: "output" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.selectCatalyst("formal");
      result.current.setLanguage("Japanese");
    });

    await act(async () => {
      await result.current.transmute([{ type: "text", text: "hello" }]);
    });

    expect(result.current.result).toEqual(payload);
    expect(result.current.isLoading).toBe(false);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.catalystKey).toBe("formal");
    expect(body.language).toBe("Japanese");
    expect(mockFetch).toHaveBeenCalledWith("/api/transmute/recipe-1", expect.anything());
  });

  it("compare calls fetch and sets compareResults", async () => {
    const payload = { a: "x", b: "y" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { result } = renderHook(() => useAlchemy({ initialRecipeId: "recipe-1" }));

    act(() => {
      result.current.setCompareKeys(["a", "b"]);
    });

    await act(async () => {
      await result.current.compare([{ type: "text", text: "hello" }]);
    });

    expect(result.current.compareResults).toEqual(payload);
    expect(result.current.isLoading).toBe(false);
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
    expect(result.current.compareResults).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
