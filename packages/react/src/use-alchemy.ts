import { useCallback, useState } from "react";
import type { MaterialInput } from "./types.js";
import { useCompare } from "./use-compare.js";
import { useGenerate } from "./use-generate.js";
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

  // Generate mode
  generateMode: boolean;
  setGenerateMode: (on: boolean) => void;
  generateCount: number;
  setGenerateCount: (count: number) => void;
  selectedVariationKey: string | null;
  selectVariation: (key: string | null) => void;

  // Actions
  transmute: (materials: MaterialInput[]) => Promise<void>;
  compare: (materials: MaterialInput[]) => Promise<void>;
  generate: (materials: MaterialInput[]) => Promise<void>;
  preview: (materials: MaterialInput[]) => Promise<PromptPreview | undefined>;

  // Results
  result: TOutput | null;
  compareResults: Record<string, TOutput> | null;
  generateResults: Record<string, TOutput> | null;
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

  // ── Generate mode ──
  const [generateMode, setGenerateModeState] = useState(false);
  const [generateCount, setGenerateCountState] = useState(3);
  const [selectedVariationKey, setSelectedVariationKey] = useState<string | null>(null);

  // ── Low-level hooks ──
  const transmuteHook = useTransmute<TOutput>({ baseUrl, headers });
  const compareHook = useCompare<TOutput>({ baseUrl, headers });
  const generateHook = useGenerate<TOutput>({ baseUrl, headers });

  // ── Error (string) ── derived from low-level hooks or local
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Derived state ──
  const isLoading = transmuteHook.isLoading || compareHook.isLoading || generateHook.isLoading;
  const isPreviewLoading = transmuteHook.isPreviewLoading;
  const error =
    localError ??
    transmuteHook.error?.message ??
    compareHook.error?.message ??
    generateHook.error?.message ??
    null;

  // ── Recipe selection resets catalyst/compare/generate/results ──
  const selectRecipe = useCallback(
    (id: string) => {
      setSelectedRecipeId(id);
      setSelectedCatalystKey(null);
      setCompareModeState(false);
      setSelectedCompareKeys([]);
      setGenerateModeState(false);
      setSelectedVariationKey(null);
      setLocalError(null);
      transmuteHook.reset();
      compareHook.reset();
      generateHook.reset();
    },
    [transmuteHook.reset, compareHook.reset, generateHook.reset],
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
      generateHook.reset();
    },
    [transmuteHook.reset, compareHook.reset, generateHook.reset],
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

  // ── Compare mode (exclusive with generate) ──
  const setCompareMode = useCallback((on: boolean) => {
    setCompareModeState(on);
    if (!on) setSelectedCompareKeys([]);
    if (on) setGenerateModeState(false);
  }, []);

  const toggleCompareKey = useCallback((key: string) => {
    setSelectedCompareKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const setCompareKeys = useCallback((keys: string[]) => {
    setSelectedCompareKeys(keys);
  }, []);

  // ── Generate mode (exclusive with compare) ──
  const setGenerateMode = useCallback((on: boolean) => {
    setGenerateModeState(on);
    if (on) {
      setCompareModeState(false);
      setSelectedCompareKeys([]);
    }
  }, []);

  const setGenerateCount = useCallback((count: number) => {
    setGenerateCountState(Math.max(2, Math.min(5, count)));
  }, []);

  const selectVariation = useCallback((key: string | null) => {
    setSelectedVariationKey(key);
  }, []);

  // ── Actions ──
  const transmute = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      compareHook.reset();
      generateHook.reset();
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
      generateHook.reset,
    ],
  );

  const compare = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      transmuteHook.reset();
      generateHook.reset();
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
      generateHook.reset,
    ],
  );

  const generate = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      transmuteHook.reset();
      compareHook.reset();
      setSelectedVariationKey(null);
      await generateHook.generate(selectedRecipeId, materials, generateCount, {
        catalystKey: selectedCatalystKey ?? undefined,
        language: selectedLanguage ?? undefined,
      });
    },
    [
      selectedRecipeId,
      selectedCatalystKey,
      selectedLanguage,
      generateCount,
      generateHook.generate,
      transmuteHook.reset,
      compareHook.reset,
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
    setSelectedVariationKey(null);
    transmuteHook.reset();
    compareHook.reset();
    generateHook.reset();
  }, [transmuteHook.reset, compareHook.reset, generateHook.reset]);

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
    generateMode,
    setGenerateMode,
    generateCount,
    setGenerateCount,
    selectedVariationKey,
    selectVariation,
    transmute,
    compare,
    generate,
    preview,
    result: transmuteHook.data,
    compareResults: compareHook.data,
    generateResults: generateHook.data,
    previewResult: transmuteHook.previewData,
    isLoading,
    isPreviewLoading,
    error,
    resetResults,
  };
}
