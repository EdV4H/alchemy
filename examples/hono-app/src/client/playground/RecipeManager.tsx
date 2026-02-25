import { handleDeleteWithFallback, RecipeSelector } from "../shared/components.js";
import { RECIPE_ICONS } from "./constants.js";
import type { PlaygroundRecipe } from "./usePlaygroundStore.js";

function randomIcon(): string {
  return RECIPE_ICONS[Math.floor(Math.random() * RECIPE_ICONS.length)];
}

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
      onDelete={(id) =>
        handleDeleteWithFallback(recipes, id, selectedId, onDelete, (next) => {
          if (next) onSelect(next);
        })
      }
      onAdd={() => {
        const id = onAdd({
          name: "New Recipe",
          icon: randomIcon(),
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
