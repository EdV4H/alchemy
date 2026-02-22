import type { Recipe } from "@EdV4H/alchemy-core";
import { useCallback, useState } from "react";

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
  recipe: Recipe<TInput, TOutput>,
  options: UseTransmutationOptions,
): UseTransmutationResult<TInput, TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (material: TInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(options.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ material, recipeId: recipe.id }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Transmutation failed (${res.status}): ${body}`);
        }
        const result = (await res.json()) as TOutput;
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsLoading(false);
      }
    },
    [options.endpoint, recipe.id],
  );

  return { mutate, data, isLoading, error };
}

// Re-export core types for convenience
export type * from "@EdV4H/alchemy-core";
