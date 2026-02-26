import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "alchemy-openai-api-key";

let currentKey = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
})();

const listeners = new Set<() => void>();

function getSnapshot(): string {
  return currentKey;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setKey(key: string) {
  currentKey = key;
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
  for (const listener of listeners) listener();
}

export function useApiKeyStore() {
  const apiKey = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const setApiKey = useCallback((key: string) => setKey(key), []);
  const clearApiKey = useCallback(() => setKey(""), []);

  const headers: Record<string, string> | undefined = apiKey
    ? { "X-OpenAI-API-Key": apiKey }
    : undefined;

  return { apiKey, setApiKey, clearApiKey, headers };
}
