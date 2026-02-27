import { useCallback, useRef, useState } from "react";
import type { MaterialInput } from "./types.js";

export interface UseGenerateOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface UseGenerateResult<TOutput = unknown> {
  generate: (
    recipeId: string,
    materials: MaterialInput[],
    count: number,
    options?: { catalystKey?: string; language?: string },
  ) => Promise<Record<string, TOutput> | undefined>;
  data: Record<string, TOutput> | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useGenerate<TOutput = unknown>(
  options?: UseGenerateOptions,
): UseGenerateResult<TOutput> {
  const baseUrl = options?.baseUrl ?? "";
  const extraHeaders = options?.headers;
  const [data, setData] = useState<Record<string, TOutput> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (
      recipeId: string,
      materials: MaterialInput[],
      count: number,
      opts?: { catalystKey?: string; language?: string },
    ): Promise<Record<string, TOutput> | undefined> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/generate/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify({
            materials,
            count,
            catalystKey: opts?.catalystKey,
            language: opts?.language,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`${res.status}: ${body}`);
        }
        const result = (await res.json()) as Record<string, TOutput>;
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

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { generate, data, isLoading, error, reset };
}
