import { useCallback, useRef, useState } from "react";
import type { MaterialInput } from "./types.js";

export interface UseCompareOptions {
  baseUrl?: string;
}

export interface UseCompareResult<TOutput = unknown> {
  compare: (
    recipeId: string,
    materials: MaterialInput[],
    catalystKeys: string[],
    options?: { language?: string },
  ) => Promise<Record<string, TOutput> | undefined>;
  data: Record<string, TOutput> | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useCompare<TOutput = unknown>(
  options?: UseCompareOptions,
): UseCompareResult<TOutput> {
  const baseUrl = options?.baseUrl ?? "";
  const [data, setData] = useState<Record<string, TOutput> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const compare = useCallback(
    async (
      recipeId: string,
      materials: MaterialInput[],
      catalystKeys: string[],
      opts?: { language?: string },
    ): Promise<Record<string, TOutput> | undefined> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/compare/${recipeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materials,
            catalystKeys,
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
    [baseUrl],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { compare, data, isLoading, error, reset };
}
