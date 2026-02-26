import { useCallback, useRef, useState } from "react";
import type { MaterialInput } from "./types.js";

export interface UseTransmuteOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface PromptPreview {
  system?: string;
  user: string;
}

export interface UseTransmuteResult<TOutput = unknown> {
  transmute: (
    recipeId: string,
    materials: MaterialInput[],
    options?: { catalystKey?: string; language?: string },
  ) => Promise<TOutput | undefined>;
  preview: (
    recipeId: string,
    materials: MaterialInput[],
    options?: { catalystKey?: string; language?: string },
  ) => Promise<PromptPreview | undefined>;
  data: TOutput | null;
  previewData: PromptPreview | null;
  isLoading: boolean;
  isPreviewLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useTransmute<TOutput = unknown>(
  options?: UseTransmuteOptions,
): UseTransmuteResult<TOutput> {
  const baseUrl = options?.baseUrl ?? "";
  const extraHeaders = options?.headers;
  const [data, setData] = useState<TOutput | null>(null);
  const [previewData, setPreviewData] = useState<PromptPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  const transmute = useCallback(
    async (
      recipeId: string,
      materials: MaterialInput[],
      opts?: { catalystKey?: string; language?: string },
    ): Promise<TOutput | undefined> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/transmute/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify({
            materials,
            catalystKey: opts?.catalystKey,
            language: opts?.language,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`${res.status}: ${body}`);
        }
        const result = (await res.json()) as TOutput;
        setData(result);
        return result;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return undefined;
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl, extraHeaders],
  );

  const preview = useCallback(
    async (
      recipeId: string,
      materials: MaterialInput[],
      opts?: { catalystKey?: string; language?: string },
    ): Promise<PromptPreview | undefined> => {
      previewAbortRef.current?.abort();
      const controller = new AbortController();
      previewAbortRef.current = controller;

      setIsPreviewLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/preview/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify({
            materials,
            catalystKey: opts?.catalystKey,
            language: opts?.language,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`${res.status}: ${body}`);
        }
        const result = (await res.json()) as PromptPreview;
        setPreviewData(result);
        return result;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return undefined;
        throw e;
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [baseUrl, extraHeaders],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    previewAbortRef.current?.abort();
    setData(null);
    setPreviewData(null);
    setError(null);
    setIsLoading(false);
    setIsPreviewLoading(false);
  }, []);

  return { transmute, preview, data, previewData, isLoading, isPreviewLoading, error, reset };
}
