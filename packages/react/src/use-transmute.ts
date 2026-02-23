import { useCallback, useRef, useState } from "react";
import type { MaterialInput } from "./types.js";

export interface UseTransmuteOptions {
  baseUrl?: string;
}

export interface UseTransmuteResult<TOutput = unknown> {
  transmute: (
    recipeId: string,
    materials: MaterialInput[],
    options?: { catalystKey?: string; language?: string },
  ) => Promise<TOutput | undefined>;
  data: TOutput | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useTransmute<TOutput = unknown>(
  options?: UseTransmuteOptions,
): UseTransmuteResult<TOutput> {
  const baseUrl = options?.baseUrl ?? "";
  const [data, setData] = useState<TOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
          headers: { "Content-Type": "application/json" },
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
    [baseUrl],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { transmute, data, isLoading, error, reset };
}
