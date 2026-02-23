import { useCallback, useState } from "react";
import type { MaterialInput } from "./types.js";
import { useCompare } from "./use-compare.js";
import { useTransmute } from "./use-transmute.js";

export interface UseAlchemyOptions {
  baseUrl?: string;
  initialRecipeId: string;
}

export interface UseAlchemyResult {
  // Recipe
  selectedRecipeId: string;
  selectRecipe: (id: string) => void;

  // Material selection (ID ベース)
  selectedIds: Set<string>;
  toggleMaterial: (id: string) => void;
  clearSelection: () => void;

  // Catalyst
  selectedCatalystKey: string | null;
  selectCatalyst: (key: string | null) => void;

  // Language
  selectedLanguage: string | null;
  setLanguage: (lang: string | null) => void;

  // Compare mode
  compareMode: boolean;
  setCompareMode: (on: boolean) => void;
  selectedCompareKeys: string[];
  toggleCompareKey: (key: string) => void;
  setCompareKeys: (keys: string[]) => void;

  // Actions
  transmute: (materials: MaterialInput[]) => Promise<void>;
  compare: (materials: MaterialInput[]) => Promise<void>;

  // Results
  result: unknown;
  compareResults: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;
  resetResults: () => void;
}

export function useAlchemy(options: UseAlchemyOptions): UseAlchemyResult {
  const { initialRecipeId, baseUrl } = options;

  // ── Recipe ──
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipeId);

  // ── Material selection ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Catalyst ──
  const [selectedCatalystKey, setSelectedCatalystKey] = useState<string | null>(null);

  // ── Language ──
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // ── Compare mode ──
  const [compareMode, setCompareModeState] = useState(false);
  const [selectedCompareKeys, setSelectedCompareKeys] = useState<string[]>([]);

  // ── Low-level hooks ──
  const transmuteHook = useTransmute({ baseUrl });
  const compareHook = useCompare({ baseUrl });

  // ── Error (string) ── derived from low-level hooks or local
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Derived state ──
  const isLoading = transmuteHook.isLoading || compareHook.isLoading;
  const error = localError ?? transmuteHook.error?.message ?? compareHook.error?.message ?? null;

  // ── Recipe selection resets catalyst/compare/results ──
  const selectRecipe = useCallback(
    (id: string) => {
      setSelectedRecipeId(id);
      setSelectedCatalystKey(null);
      setCompareModeState(false);
      setSelectedCompareKeys([]);
      setLocalError(null);
      transmuteHook.reset();
      compareHook.reset();
    },
    [transmuteHook.reset, compareHook.reset],
  );

  // ── Material toggle ──
  const toggleMaterial = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setLocalError(null);
      transmuteHook.reset();
      compareHook.reset();
    },
    [transmuteHook.reset, compareHook.reset],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ── Catalyst ──
  const selectCatalyst = useCallback((key: string | null) => {
    setSelectedCatalystKey(key);
  }, []);

  // ── Language ──
  const setLanguage = useCallback((lang: string | null) => {
    setSelectedLanguage(lang);
  }, []);

  // ── Compare mode ──
  const setCompareMode = useCallback((on: boolean) => {
    setCompareModeState(on);
    if (!on) setSelectedCompareKeys([]);
  }, []);

  const toggleCompareKey = useCallback((key: string) => {
    setSelectedCompareKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const setCompareKeys = useCallback((keys: string[]) => {
    setSelectedCompareKeys(keys);
  }, []);

  // ── Actions ──
  const transmute = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      compareHook.reset();
      await transmuteHook.transmute(selectedRecipeId, materials, {
        catalystKey: selectedCatalystKey ?? undefined,
        language: selectedLanguage ?? undefined,
      });
    },
    [
      selectedRecipeId,
      selectedCatalystKey,
      selectedLanguage,
      transmuteHook.transmute,
      compareHook.reset,
    ],
  );

  const compare = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      transmuteHook.reset();
      await compareHook.compare(selectedRecipeId, materials, selectedCompareKeys, {
        language: selectedLanguage ?? undefined,
      });
    },
    [
      selectedRecipeId,
      selectedCompareKeys,
      selectedLanguage,
      compareHook.compare,
      transmuteHook.reset,
    ],
  );

  // ── Reset ──
  const resetResults = useCallback(() => {
    setLocalError(null);
    transmuteHook.reset();
    compareHook.reset();
  }, [transmuteHook.reset, compareHook.reset]);

  return {
    selectedRecipeId,
    selectRecipe,
    selectedIds,
    toggleMaterial,
    clearSelection,
    selectedCatalystKey,
    selectCatalyst,
    selectedLanguage,
    setLanguage,
    compareMode,
    setCompareMode,
    selectedCompareKeys,
    toggleCompareKey,
    setCompareKeys,
    transmute,
    compare,
    result: transmuteHook.data,
    compareResults: compareHook.data,
    isLoading,
    error,
    resetResults,
  };
}
