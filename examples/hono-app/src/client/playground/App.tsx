import { useCallback, useState } from "react";
import { ApiKeyInput } from "../shared/ApiKeyInput.js";
import { CopyPromptButton } from "../shared/CopyPromptButton.js";
import {
  LanguageSelect,
  MaterialShelf,
  PageShell,
  ResultPanel,
  SelectedMaterialsPreview,
  TransmuteButton,
} from "../shared/components.js";
import {
  deleteButtonStyle,
  fieldLabelStyle,
  inputStyle,
  labelStyle,
  selectStyle,
} from "../shared/styles.js";
import { customMaterialIcon } from "../shared/types.js";
import { useApiKeyStore } from "../shared/useApiKeyStore.js";
import { CatalystEditor } from "./CatalystEditor.js";
import { CodeEditor } from "./CodeEditor.js";
import { AVAILABLE_TRANSFORMS } from "./constants.js";
import { RecipeManager } from "./RecipeManager.js";
import { usePlaygroundStore } from "./usePlaygroundStore.js";
import { usePlaygroundTransmute } from "./usePlaygroundTransmute.js";

export function App() {
  const store = usePlaygroundStore();
  const { headers } = useApiKeyStore();
  const { transmute, preview, result, isLoading, error, reset } = usePlaygroundTransmute({
    headers,
  });

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

  const handlePreview = useCallback(async () => {
    if (!selectedRecipe) throw new Error("No recipe selected");
    const materials = store.materials.filter((m) => selectedMaterialIds.has(m.id));
    if (materials.length === 0) throw new Error("No materials selected");

    return preview({
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
    preview,
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

  const materialsWithIcons = store.materials.map((m) => ({
    ...m,
    icon: customMaterialIcon(m.type),
  }));

  const hasSelectedMaterials =
    selectedMaterialIds.size > 0 && store.materials.some((m) => selectedMaterialIds.has(m.id));

  return (
    <PageShell
      title="Playground"
      subtitle="Write custom recipes, configure catalysts, and transmute materials"
      headerExtra={<ApiKeyInput />}
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
                  <div style={fieldLabelStyle}>Icon</div>
                  <input
                    value={selectedRecipe.icon ?? ""}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, { icon: e.target.value })
                    }
                    style={{ ...inputStyle, textAlign: "center" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={fieldLabelStyle}>Recipe Name</div>
                  <input
                    value={selectedRecipe.name}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, { name: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ width: 100 }}>
                  <div style={fieldLabelStyle}>Output</div>
                  <select
                    value={selectedRecipe.outputType}
                    onChange={(e) =>
                      store.updateRecipe(selectedRecipe.id, {
                        outputType: e.target.value as "text" | "json",
                      })
                    }
                    style={selectStyle}
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
                <div style={{ ...labelStyle, marginBottom: 2 }}>Transforms</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
                  素材をLLMに渡す前に加工するパイプライン（上から順に適用）
                </div>
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
                          style={{ ...deleteButtonStyle, fontSize: 12, padding: 0 }}
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
                      <option key={t.value} value={t.value}>
                        {t.value} — {t.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Catalyst + Language */}
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...labelStyle, margin: 0 }}>Catalyst</span>
              <CatalystEditor
                catalysts={store.catalysts}
                selectedId={selectedCatalystId}
                onSelect={setSelectedCatalystId}
                onAdd={store.addCatalyst}
                onUpdate={store.updateCatalyst}
                onDelete={store.deleteCatalyst}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Language</span>
                <LanguageSelect value={selectedLanguage} onChange={setSelectedLanguage} />
              </div>
            </div>
          </div>

          <SelectedMaterialsPreview
            materials={materialsWithIcons
              .filter((m) => selectedMaterialIds.has(m.id))
              .map((m) => ({
                id: m.id,
                icon: m.icon,
                label: m.label,
                imageUrl: m.imageUrl,
                text: m.text ?? m.dataContent ?? m.documentText,
              }))}
            emptyMessage="Select materials from the shelf"
            onClear={() => setSelectedMaterialIds(new Set())}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <TransmuteButton
                onClick={handleTransmute}
                disabled={isLoading || !hasSelectedMaterials || !selectedRecipe}
                isLoading={isLoading}
              />
            </div>
            <div style={{ flex: 1 }}>
              <CopyPromptButton
                onFetchPreview={handlePreview}
                disabled={isLoading || !hasSelectedMaterials || !selectedRecipe}
              />
            </div>
          </div>

          <ResultPanel result={result} isLoading={isLoading} error={error} />
        </div>
      }
      right={
        <MaterialShelf
          customItems={materialsWithIcons}
          selectedIds={selectedMaterialIds}
          onToggle={toggleMaterial}
          onAddCustom={store.addMaterial}
          onDeleteCustom={handleDeleteMaterial}
        />
      }
    />
  );
}
