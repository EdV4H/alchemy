import { useCallback, useSyncExternalStore } from "react";

export type TransmuterProvider = "openai" | "anthropic" | "google";

const PROVIDER_KEY = "alchemy-transmuter-provider";
const OLD_OPENAI_KEY = "alchemy-openai-api-key";

function storageKeyFor(provider: TransmuterProvider): string {
  return `alchemy-api-key-${provider}`;
}

function headerKeyFor(provider: TransmuterProvider): string {
  switch (provider) {
    case "openai":
      return "X-OpenAI-API-Key";
    case "anthropic":
      return "X-Anthropic-API-Key";
    case "google":
      return "X-Google-API-Key";
  }
}

// Migrate old key format
function migrateOldKey() {
  try {
    const old = localStorage.getItem(OLD_OPENAI_KEY);
    if (old) {
      localStorage.setItem(storageKeyFor("openai"), old);
      localStorage.removeItem(OLD_OPENAI_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

migrateOldKey();

let currentProvider: TransmuterProvider = (() => {
  try {
    return (localStorage.getItem(PROVIDER_KEY) as TransmuterProvider) || "openai";
  } catch {
    return "openai";
  }
})();

let currentKey = (() => {
  try {
    return localStorage.getItem(storageKeyFor(currentProvider)) ?? "";
  } catch {
    return "";
  }
})();

const listeners = new Set<() => void>();

// Snapshot is a composite string so useSyncExternalStore re-renders on any change
function getSnapshot(): string {
  return `${currentProvider}::${currentKey}`;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) listener();
}

function setProvider(provider: TransmuterProvider) {
  currentProvider = provider;
  try {
    localStorage.setItem(PROVIDER_KEY, provider);
  } catch {
    // localStorage unavailable
  }
  // Load key for new provider
  try {
    currentKey = localStorage.getItem(storageKeyFor(provider)) ?? "";
  } catch {
    currentKey = "";
  }
  notify();
}

function setKey(key: string) {
  currentKey = key;
  try {
    if (key) {
      localStorage.setItem(storageKeyFor(currentProvider), key);
    } else {
      localStorage.removeItem(storageKeyFor(currentProvider));
    }
  } catch {
    // localStorage unavailable
  }
  notify();
}

export function useApiKeyStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "openai::");

  const provider = snapshot.split("::")[0] as TransmuterProvider;
  const apiKey = snapshot.split("::").slice(1).join("::");

  const setApiKey = useCallback((key: string) => setKey(key), []);
  const clearApiKey = useCallback(() => setKey(""), []);
  const changeProvider = useCallback((p: TransmuterProvider) => setProvider(p), []);

  const headers: Record<string, string> | undefined = apiKey
    ? {
        "X-Transmuter-Provider": provider,
        [headerKeyFor(provider)]: apiKey,
      }
    : undefined;

  return { provider, setProvider: changeProvider, apiKey, setApiKey, clearApiKey, headers };
}
