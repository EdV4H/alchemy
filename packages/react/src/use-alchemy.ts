import { useCallback, useState } from "react";
import type { MaterialInput } from "./types.js";
import { useCompare } from "./use-compare.js";
import type { PromptPreview } from "./use-transmute.js";
import { useTransmute } from "./use-transmute.js";

export interface UseAlchemyOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  initialRecipeId: string;
}

export interface UseAlchemyResult<TOutput = unknown> {
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
  preview: (materials: MaterialInput[]) => Promise<PromptPreview | undefined>;

  // Results
  result: TOutput | null;
  compareResults: Record<string, TOutput> | null;
  previewResult: PromptPreview | null;
  isLoading: boolean;
  isPreviewLoading: boolean;
  error: string | null;
  resetResults: () => void;
}

export function useAlchemy<TOutput = unknown>(
  options: UseAlchemyOptions,
): UseAlchemyResult<TOutput> {
  const { initialRecipeId, baseUrl, headers } = options;

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
  const transmuteHook = useTransmute<TOutput>({ baseUrl, headers });
  const compareHook = useCompare<TOutput>({ baseUrl, headers });

  // ── Error (string) ── derived from low-level hooks or local
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Derived state ──
  const isLoading = transmuteHook.isLoading || compareHook.isLoading;
  const isPreviewLoading = transmuteHook.isPreviewLoading;
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

  // ── Preview ──
  const preview = useCallback(
    async (materials: MaterialInput[]) => {
      return transmuteHook.preview(selectedRecipeId, materials, {
        catalystKey: selectedCatalystKey ?? undefined,
        language: selectedLanguage ?? undefined,
      });
    },
    [selectedRecipeId, selectedCatalystKey, selectedLanguage, transmuteHook.preview],
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
    preview,
    result: transmuteHook.data,
    compareResults: compareHook.data,
    previewResult: transmuteHook.previewData,
    isLoading,
    isPreviewLoading,
    error,
    resetResults,
  };
}
