import { useCallback, useSyncExternalStore } from "react";
import type { CustomMaterial } from "../shared/types.js";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlaygroundRecipe {
  id: string;
  name: string;
  icon?: string;
  promptTemplate: string;
  outputType: "text" | "json";
  transforms: string[];
  defaultCatalystId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlaygroundCatalyst {
  id: string;
  name: string;
  roleDefinition: string;
  temperature: number;
  model?: string;
}

interface PlaygroundStorage {
  version: 2;
  recipes: PlaygroundRecipe[];
  catalysts: PlaygroundCatalyst[];
  materials: CustomMaterial[];
}

// ─── Storage engine ─────────────────────────────────────────────────────────

const STORAGE_KEY = "alchemy-playground";

const STARTER_RECIPE: PlaygroundRecipe = {
  id: crypto.randomUUID(),
  name: "Simple Summarizer",
  icon: "📝",
  promptTemplate: "Summarize in 3 bullet points:\n\n{{text}}",
  outputType: "text",
  transforms: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const DEFAULT_CATALYST: PlaygroundCatalyst = {
  id: crypto.randomUUID(),
  name: "Default",
  roleDefinition: "You are a helpful assistant.",
  temperature: 0.4,
};

function migrateSpellCode(spellCode: string): string {
  // Best-effort: extract the template string from common patterns
  // e.g. "const text = extractText(parts);\nreturn `...${ text }`;"
  const templateMatch = spellCode.match(/return\s*`([\s\S]*)`\s*;?\s*$/);
  if (templateMatch) {
    let template = templateMatch[1];
    template = template.replace(/\$\{text\}/g, "{{text}}");
    template = template.replace(/\$\{extractText\(parts\)\}/g, "{{text}}");
    template = template.replace(/\$\{extractAllText\(parts\)\}/g, "{{allText}}");
    template = template.replace(/\$\{isTextOnly\(parts\)\}/g, "{{textOnly}}");
    // Unescape \\n to real newlines
    template = template.replace(/\\n/g, "\n");
    return template;
  }
  // Fallback: cannot convert, use simple template
  return "{{text}}";
}

interface PlaygroundStorageV1 {
  version: 1;
  recipes: (Omit<PlaygroundRecipe, "promptTemplate"> & { spellCode: string })[];
  catalysts: PlaygroundCatalyst[];
  materials: CustomMaterial[];
}

function migrateV1toV2(v1: PlaygroundStorageV1): PlaygroundStorage {
  return {
    version: 2,
    recipes: v1.recipes.map(({ spellCode, ...rest }) => ({
      ...rest,
      promptTemplate: migrateSpellCode(spellCode),
    })),
    catalysts: v1.catalysts,
    materials: v1.materials,
  };
}

function loadStorage(): PlaygroundStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 2) return parsed as PlaygroundStorage;
      if (parsed.version === 1) {
        const migrated = migrateV1toV2(parsed as PlaygroundStorageV1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    // ignore corrupt data
  }
  const initial: PlaygroundStorage = {
    version: 2,
    recipes: [STARTER_RECIPE],
    catalysts: [DEFAULT_CATALYST],
    materials: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

let currentStorage = loadStorage();
const listeners = new Set<() => void>();

function getSnapshot(): PlaygroundStorage {
  return currentStorage;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateStorage(updater: (prev: PlaygroundStorage) => PlaygroundStorage) {
  currentStorage = updater(currentStorage);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStorage));
  for (const listener of listeners) listener();
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePlaygroundStore() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Recipes
  const addRecipe = useCallback(
    (recipe: Omit<PlaygroundRecipe, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const newRecipe: PlaygroundRecipe = {
        ...recipe,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      updateStorage((prev) => ({
        ...prev,
        recipes: [...prev.recipes, newRecipe],
      }));
      return newRecipe.id;
    },
    [],
  );

  const updateRecipe = useCallback(
    (id: string, updates: Partial<Omit<PlaygroundRecipe, "id" | "createdAt">>) => {
      updateStorage((prev) => ({
        ...prev,
        recipes: prev.recipes.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r,
        ),
      }));
    },
    [],
  );

  const deleteRecipe = useCallback((id: string) => {
    updateStorage((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.id !== id),
    }));
  }, []);

  // Catalysts
  const addCatalyst = useCallback((catalyst: Omit<PlaygroundCatalyst, "id">) => {
    const newCatalyst: PlaygroundCatalyst = {
      ...catalyst,
      id: crypto.randomUUID(),
    };
    updateStorage((prev) => ({
      ...prev,
      catalysts: [...prev.catalysts, newCatalyst],
    }));
    return newCatalyst.id;
  }, []);

  const updateCatalyst = useCallback(
    (id: string, updates: Partial<Omit<PlaygroundCatalyst, "id">>) => {
      updateStorage((prev) => ({
        ...prev,
        catalysts: prev.catalysts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
    },
    [],
  );

  const deleteCatalyst = useCallback((id: string) => {
    updateStorage((prev) => ({
      ...prev,
      catalysts: prev.catalysts.filter((c) => c.id !== id),
    }));
  }, []);

  // Materials
  const addMaterial = useCallback((material: CustomMaterial) => {
    updateStorage((prev) => ({
      ...prev,
      materials: [...prev.materials, material],
    }));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    updateStorage((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  }, []);

  return {
    recipes: store.recipes,
    catalysts: store.catalysts,
    materials: store.materials,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addCatalyst,
    updateCatalyst,
    deleteCatalyst,
    addMaterial,
    deleteMaterial,
  };
}
