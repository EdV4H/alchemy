import { useCallback, useState } from "react";
import {
  LanguageSelect,
  MaterialShelf,
  PageShell,
  ResultPanel,
  TransmuteButton,
} from "../shared/components.js";
import { labelStyle } from "../shared/styles.js";
import { customMaterialIcon } from "../shared/types.js";
import { CatalystEditor } from "./CatalystEditor.js";
import { CodeEditor } from "./CodeEditor.js";
import { RecipeManager } from "./RecipeManager.js";
import { usePlaygroundStore } from "./usePlaygroundStore.js";
import { usePlaygroundTransmute } from "./usePlaygroundTransmute.js";

const AVAILABLE_TRANSFORMS = [
  "truncateText(4000)",
  "truncateText(2000)",
  "truncateText(8000)",
  'filterByType("text")',
  'filterByType("image")',
  'filterByType("data")',
  'prependText("")',
  "dataToText()",
  "documentToText()",
  "imageUrlToBase64()",
];

export function App() {
  const store = usePlaygroundStore();
  const { transmute, result, isLoading, error, reset } = usePlaygroundTransmute();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(store.recipes[0]?.id ?? "");
  const [selectedCatalystId, setSelectedCatalystId] = useState<string | null>(
    store.catalysts[0]?.id ?? null,
  );
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const selectedRecipe = store.recipes.find((r) => r.id === selectedRecipeId);
  const selectedCatalyst = store.catalysts.find((c) => c.id === selectedCatalystId);

  const toggleMaterial = useCallback((id: string) => {
    setSelectedMaterialIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteMaterial = useCallback(
    (id: string) => {
      store.deleteMaterial(id);
      setSelectedMaterialIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [store.deleteMaterial],
  );

  const handleTransmute = useCallback(() => {
    if (!selectedRecipe) return;
    const materials = store.materials.filter((m) => selectedMaterialIds.has(m.id));
    if (materials.length === 0) return;

    transmute({
      materials,
      promptTemplate: selectedRecipe.promptTemplate,
      outputType: selectedRecipe.outputType,
      transforms: selectedRecipe.transforms,
      catalyst: selectedCatalyst ?? undefined,
      language: selectedLanguage || undefined,
    });
  }, [
    selectedRecipe,
    selectedCatalyst,
    selectedLanguage,
    store.materials,
    selectedMaterialIds,
    transmute,
  ]);

  const handleAddTransform = useCallback(
    (expr: string) => {
      if (!selectedRecipe) return;
      store.updateRecipe(selectedRecipe.id, {
        transforms: [...selectedRecipe.transforms, expr],
      });
    },
    [selectedRecipe, store.updateRecipe],
  );

  const handleRemoveTransform = useCallback(
    (index: number) => {
      if (!selectedRecipe) return;
      store.updateRecipe(selectedRecipe.id, {
        transforms: selectedRecipe.transforms.filter((_, i) => i !== index),
      });
    },
    [selectedRecipe, store.updateRecipe],
  );

  const hasSelectedMaterials =
    selectedMaterialIds.size > 0 && store.materials.some((m) => selectedMaterialIds.has(m.id));

  return (
    <PageShell
      title="Playground"
      subtitle="Write custom recipes, configure catalysts, and transmute materials"
      rightWidth={380}
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Recipes</div>
            <RecipeManager
              recipes={store.recipes}
              selectedId={selectedRecipeId}
              onSelect={(id) => {
                setSelectedRecipeId(id);
                reset();
              }}
              onAdd={store.addRecipe}
              onDelete={store.deleteRecipe}
            />
          </div>

          {selectedRecipe && (
            <>
              {/* Icon + Recipe name + output type */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 50 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Icon</div>
                  <input
                    value={selectedRecipe.icon ?? ""}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, { icon: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      fontSize: 13,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Recipe Name</div>
                  <input
                    value={selectedRecipe.name}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, { name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      fontSize: 13,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Output</div>
                  <select
                    value={selectedRecipe.outputType}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, {
                        outputType: e.target.value as "text" | "json",
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      fontSize: 13,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      background: "#fff",
                    }}
                  >
                    <option value="text">text</option>
                    <option value="json">json</option>
                  </select>
                </div>
              </div>

              {/* Code editor */}
              <CodeEditor
                value={selectedRecipe.promptTemplate}
                onChange={(value) =>
                  store.updateRecipe(selectedRecipe.id, { promptTemplate: value })
                }
              />

              {/* Transforms */}
              <div>
                <div style={{ ...labelStyle, marginBottom: 6 }}>Transforms</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedRecipe.transforms.map((t, i) => {
                    const transformKey = `transform-${i.toString()}-${t}`;
                    return (
                      <span
                        key={transformKey}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          fontSize: 11,
                          background: "#f0f0f0",
                          borderRadius: 4,
                          fontFamily: "monospace",
                          color: "#555",
                        }}
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTransform(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#999",
                            cursor: "pointer",
                            fontSize: 12,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleAddTransform(e.target.value);
                      e.target.value = "";
                    }}
                    style={{
                      padding: "3px 6px",
                      fontSize: 11,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      background: "#fff",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">+ Add Transform</option>
                    {AVAILABLE_TRANSFORMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Catalysts</div>
            <CatalystEditor
              catalysts={store.catalysts}
              selectedId={selectedCatalystId}
              onSelect={setSelectedCatalystId}
              onAdd={store.addCatalyst}
              onUpdate={store.updateCatalyst}
              onDelete={store.deleteCatalyst}
            />
          </div>
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MaterialShelf
            customItems={store.materials.map((m) => ({ ...m, icon: customMaterialIcon(m.type) }))}
            selectedIds={selectedMaterialIds}
            onToggle={toggleMaterial}
            onAddCustom={store.addMaterial}
            onDeleteCustom={handleDeleteMaterial}
          />

          {/* Catalyst + Language selectors */}
          <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Catalyst</div>
              <select
                value={selectedCatalystId ?? ""}
                onChange={(e) => setSelectedCatalystId(e.target.value || null)}
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  fontSize: 12,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  background: "#fff",
                }}
              >
                {store.catalysts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: 100 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Language</div>
              <LanguageSelect value={selectedLanguage} onChange={setSelectedLanguage} />
            </div>
          </div>

          <TransmuteButton
            onClick={handleTransmute}
            disabled={isLoading || !hasSelectedMaterials || !selectedRecipe}
            isLoading={isLoading}
          />

          <ResultPanel result={result} isLoading={isLoading} error={error} />
        </div>
      }
    />
  );
}
