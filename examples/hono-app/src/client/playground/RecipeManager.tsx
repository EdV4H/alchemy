import { RecipeSelector } from "../shared/components.js";
import type { PlaygroundRecipe } from "./usePlaygroundStore.js";

interface RecipeManagerProps {
  recipes: PlaygroundRecipe[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (recipe: Omit<PlaygroundRecipe, "id" | "createdAt" | "updatedAt">) => string;
  onDelete: (id: string) => void;
}

export function RecipeManager({
  recipes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: RecipeManagerProps) {
  return (
    <RecipeSelector
      items={recipes.map((r) => ({ id: r.id, label: r.name, icon: r.icon }))}
      selectedId={selectedId}
      onSelect={onSelect}
      onDelete={(id) => {
        onDelete(id);
        if (selectedId === id) {
          const remaining = recipes.filter((r) => r.id !== id);
          if (remaining.length > 0) onSelect(remaining[0].id);
        }
      }}
      onAdd={() => {
        const id = onAdd({
          name: "New Recipe",
          icon: "📋",
          promptTemplate: "Process this text:\n\n{{text}}",
          outputType: "text",
          transforms: [],
        });
        onSelect(id);
      }}
      minItems={1}
    />
  );
}
