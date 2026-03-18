import { useCallback, useState } from "react";
import type { MaterialInput } from "./types.js";
import type { GenerateResultEntry } from "./use-generate.js";
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

  // Language
  selectedLanguage: string | null;
  setLanguage: (lang: string | null) => void;

  // Generate mode
  generateMode: boolean;
  setGenerateMode: (on: boolean) => void;
  generateCount: number;
  setGenerateCount: (count: number) => void;
  selectedVariationKey: string | null;
  selectVariation: (key: string | null) => void;

  // Actions
  transmute: (materials: MaterialInput[]) => Promise<void>;
  generate: (materials: MaterialInput[]) => Promise<void>;
  preview: (materials: MaterialInput[]) => Promise<PromptPreview | undefined>;

  // Results
  result: TOutput | null;
  generateResults: Record<string, GenerateResultEntry<TOutput>> | null;
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

  // ── Language ──
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // ── Generate mode ──
  const [generateMode, setGenerateModeState] = useState(false);
  const [generateCount, setGenerateCountState] = useState(3);
  const [selectedVariationKey, setSelectedVariationKey] = useState<string | null>(null);

  // ── Low-level hooks ──
  const transmuteHook = useTransmute<TOutput>({ baseUrl, headers });
  const generateHook = useGenerate<TOutput>({ baseUrl, headers });

  // ── Error (string) ── derived from low-level hooks or local
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Derived state ──
  const isLoading = transmuteHook.isLoading || generateHook.isLoading;
  const isPreviewLoading = transmuteHook.isPreviewLoading;
  const error = localError ?? transmuteHook.error?.message ?? generateHook.error?.message ?? null;

  // ── Recipe selection resets state ──
  const selectRecipe = useCallback(
    (id: string) => {
      setSelectedRecipeId(id);
      setGenerateModeState(false);
      setSelectedVariationKey(null);
      setLocalError(null);
      transmuteHook.reset();
      generateHook.reset();
    },
    [transmuteHook.reset, generateHook.reset],
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
      generateHook.reset();
    },
    [transmuteHook.reset, generateHook.reset],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ── Language ──
  const setLanguage = useCallback((lang: string | null) => {
    setSelectedLanguage(lang);
  }, []);

  // ── Generate mode ──
  const setGenerateMode = useCallback((on: boolean) => {
    setGenerateModeState(on);
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
      generateHook.reset();
      await transmuteHook.transmute(selectedRecipeId, materials, {
        language: selectedLanguage ?? undefined,
      });
    },
    [selectedRecipeId, selectedLanguage, transmuteHook.transmute, generateHook.reset],
  );

  const generate = useCallback(
    async (materials: MaterialInput[]) => {
      setLocalError(null);
      transmuteHook.reset();
      setSelectedVariationKey(null);
      await generateHook.generate(selectedRecipeId, materials, generateCount, {
        language: selectedLanguage ?? undefined,
      });
    },
    [selectedRecipeId, selectedLanguage, generateCount, generateHook.generate, transmuteHook.reset],
  );

  // ── Preview ──
  const preview = useCallback(
    async (materials: MaterialInput[]) => {
      return transmuteHook.preview(selectedRecipeId, materials, {
        language: selectedLanguage ?? undefined,
      });
    },
    [selectedRecipeId, selectedLanguage, transmuteHook.preview],
  );

  // ── Reset ──
  const resetResults = useCallback(() => {
    setLocalError(null);
    setSelectedVariationKey(null);
    transmuteHook.reset();
    generateHook.reset();
  }, [transmuteHook.reset, generateHook.reset]);

  return {
    selectedRecipeId,
    selectRecipe,
    selectedIds,
    toggleMaterial,
    clearSelection,
    selectedLanguage,
    setLanguage,
    generateMode,
    setGenerateMode,
    generateCount,
    setGenerateCount,
    selectedVariationKey,
    selectVariation,
    transmute,
    generate,
    preview,
    result: transmuteHook.data,
    generateResults: generateHook.data,
    previewResult: transmuteHook.previewData,
    isLoading,
    isPreviewLoading,
    error,
    resetResults,
  };
}
