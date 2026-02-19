import { useState, useCallback } from "react";
import type { Recipe } from "@EdV4H/alchemy-core";

interface UseTransmutationOptions {
  endpoint: string;
}

interface UseTransmutationResult<TInput, TOutput> {
  mutate: (material: TInput) => Promise<void>;
  data: TOutput | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTransmutation<TInput, TOutput>(
  _recipe: Recipe<TInput, TOutput>,
  _options: UseTransmutationOptions,
): UseTransmutationResult<TInput, TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (_material: TInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to endpoint
      throw new Error("Not implemented");
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, data, isLoading, error };
}

// Re-export core types for convenience
export type * from "@EdV4H/alchemy-core";
