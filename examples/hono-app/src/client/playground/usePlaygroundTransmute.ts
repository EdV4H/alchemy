import { useCallback, useRef, useState } from "react";
import type { CustomMaterial } from "../shared/types.js";
import type { PlaygroundCatalyst } from "./usePlaygroundStore.js";

interface PlaygroundTransmutePayload {
  materials: CustomMaterial[];
  promptTemplate: string;
  outputType: "text" | "json";
  transforms: string[];
  catalyst?: PlaygroundCatalyst;
  language?: string;
}

interface UsePlaygroundTransmuteOptions {
  headers?: Record<string, string>;
}

interface PromptPreviewData {
  system?: string;
  user: string;
}

interface PlaygroundGeneratePayload extends PlaygroundTransmutePayload {
  count: number;
}

interface UsePlaygroundTransmuteResult {
  transmute: (payload: PlaygroundTransmutePayload) => Promise<void>;
  generate: (payload: PlaygroundGeneratePayload) => Promise<void>;
  preview: (payload: PlaygroundTransmutePayload) => Promise<PromptPreviewData>;
  result: unknown | null;
  generateResults: Record<string, unknown> | null;
  isLoading: boolean;
  isPreviewLoading: boolean;
  error: string | null;
  reset: () => void;
}

function materialToServerInput(m: CustomMaterial) {
  switch (m.type) {
    case "text":
      return { type: "text" as const, text: m.text ?? "" };
    case "image":
      return { type: "image" as const, imageUrl: m.imageUrl ?? "" };
    case "audio":
      return { type: "audio" as const, audioUrl: m.audioUrl ?? "" };
    case "video":
      return { type: "video" as const, videoUrl: m.videoUrl ?? "" };
    case "document":
      return { type: "document" as const, documentText: m.documentText ?? "" };
    case "data":
      return {
        type: "data" as const,
        dataFormat: m.dataFormat ?? ("csv" as const),
        dataContent: m.dataContent ?? "",
        dataLabel: m.label,
      };
  }
}

export function usePlaygroundTransmute(
  options?: UsePlaygroundTransmuteOptions,
): UsePlaygroundTransmuteResult {
  const extraHeaders = options?.headers;
  const [result, setResult] = useState<unknown | null>(null);
  const [generateResults, setGenerateResults] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  const transmute = useCallback(
    async (payload: PlaygroundTransmutePayload) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);
      setGenerateResults(null);

      try {
        const body = {
          materials: payload.materials.map(materialToServerInput),
          recipe: {
            promptTemplate: payload.promptTemplate,
            outputType: payload.outputType,
            transforms: payload.transforms,
          },
          catalyst: payload.catalyst
            ? {
                roleDefinition: payload.catalyst.roleDefinition,
                temperature: payload.catalyst.temperature,
                model: payload.catalyst.model || undefined,
              }
            : undefined,
          language: payload.language || undefined,
        };

        const res = await fetch("/api/playground/transmute", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? `Server error (${res.status})`);
        } else {
          setResult(data);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    },
    [extraHeaders],
  );

  const generate = useCallback(
    async (payload: PlaygroundGeneratePayload) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);
      setGenerateResults(null);

      try {
        const body = {
          materials: payload.materials.map(materialToServerInput),
          recipe: {
            promptTemplate: payload.promptTemplate,
            outputType: payload.outputType,
            transforms: payload.transforms,
          },
          catalyst: payload.catalyst
            ? {
                roleDefinition: payload.catalyst.roleDefinition,
                temperature: payload.catalyst.temperature,
                model: payload.catalyst.model || undefined,
              }
            : undefined,
          language: payload.language || undefined,
          count: payload.count,
        };

        const res = await fetch("/api/playground/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? `Server error (${res.status})`);
        } else {
          setGenerateResults(data as Record<string, unknown>);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    },
    [extraHeaders],
  );

  const preview = useCallback(
    async (payload: PlaygroundTransmutePayload): Promise<PromptPreviewData> => {
      previewAbortRef.current?.abort();
      const controller = new AbortController();
      previewAbortRef.current = controller;

      setIsPreviewLoading(true);
      try {
        const body = {
          materials: payload.materials.map(materialToServerInput),
          recipe: {
            promptTemplate: payload.promptTemplate,
            outputType: payload.outputType,
            transforms: payload.transforms,
          },
          catalyst: payload.catalyst
            ? {
                roleDefinition: payload.catalyst.roleDefinition,
                temperature: payload.catalyst.temperature,
                model: payload.catalyst.model || undefined,
              }
            : undefined,
          language: payload.language || undefined,
        };

        const res = await fetch("/api/playground/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extraHeaders },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? `Server error (${res.status})`);
        }
        return data as PromptPreviewData;
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [extraHeaders],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    previewAbortRef.current?.abort();
    setResult(null);
    setGenerateResults(null);
    setError(null);
    setIsLoading(false);
    setIsPreviewLoading(false);
  }, []);

  return {
    transmute,
    generate,
    preview,
    result,
    generateResults,
    isLoading,
    isPreviewLoading,
    error,
    reset,
  };
}
