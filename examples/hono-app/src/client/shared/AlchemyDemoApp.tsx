import type { NamedCatalyst } from "@edv4h/alchemy-node";
import type { MaterialInput } from "@edv4h/alchemy-react";
import { useAlchemy } from "@edv4h/alchemy-react";
import { useCallback, useState } from "react";
import type { RecipeEntry } from "../../shared/recipes.js";
import { ApiKeyInput } from "./ApiKeyInput.js";
import { CopyPromptButton } from "./CopyPromptButton.js";
import {
  LanguageSelect,
  MaterialShelf,
  type MaterialShelfProps,
  PageShell,
  RecipeDetail,
  RecipeSelector,
  ResultPanel,
  SelectedMaterialsPreview,
  TransmuteButton,
} from "./components.js";
import { labelStyle } from "./styles.js";
import type { CustomMaterial, MaterialCard } from "./types.js";
import { type CustomMaterialType, customMaterialIcon } from "./types.js";
import { useApiKeyStore } from "./useApiKeyStore.js";

// ─── Config ──────────────────────────────────────────────────────────────────

export interface AlchemyDemoConfig {
  title: string;
  subtitle?: string;
  emptyMessage?: string;
  materials: MaterialCard[];
  recipeEntries: RecipeEntry[];
  catalystPresets: NamedCatalyst[];
  materialGroups?: { header: string; filter: (m: MaterialCard) => boolean }[];
  customMaterialTypes?: CustomMaterialType[];
  resultMode?: "text" | "html";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AlchemyDemoApp({
  title,
  subtitle,
  emptyMessage = "Select materials from the shelf",
  materials,
  recipeEntries,
  catalystPresets,
  materialGroups,
  customMaterialTypes,
  resultMode = "text",
}: AlchemyDemoConfig) {
  const { headers } = useApiKeyStore();
  const alchemy = useAlchemy({ initialRecipeId: recipeEntries[0].recipe.id, headers });
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);

  const {
    selectedRecipeId,
    selectedIds,
    selectedCatalystKey,
    selectedLanguage,
    compareMode,
    selectedCompareKeys,
    result,
    compareResults,
    isLoading,
    error,
  } = alchemy;

  const selectedEntry = recipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  const allSelectableMaterials: (MaterialCard | (CustomMaterial & { icon: string }))[] = [
    ...materials,
    ...customMaterials.map((c) => ({
      ...c,
      icon: customMaterialIcon(c.type),
    })),
  ];

  const selectedMaterials = allSelectableMaterials.filter((m) => selectedIds.has(m.id));

  const addCustomMaterial = (m: CustomMaterial) => {
    setCustomMaterials((prev) => [...prev, m]);
    alchemy.toggleMaterial(m.id);
  };

  const removeCustomMaterial = (id: string) => {
    setCustomMaterials((prev) => prev.filter((m) => m.id !== id));
    alchemy.toggleMaterial(id);
  };

  const buildMaterialInputs = useCallback((): MaterialInput[] => {
    return selectedMaterials.flatMap((m): MaterialInput[] => {
      const category = "category" in m ? m.category : undefined;
      if (category === "data" || ("type" in m && m.type === "data")) {
        const dc = "dataContent" in m ? m.dataContent : undefined;
        const df = "dataFormat" in m ? m.dataFormat : undefined;
        if (dc && df) {
          return [{ type: "data", dataFormat: df, dataContent: dc, dataLabel: m.label }];
        }
      } else if (category === "document" || ("type" in m && m.type === "document")) {
        const dt = "documentText" in m ? m.documentText : undefined;
        if (dt) {
          return [{ type: "document", documentText: dt }];
        }
      } else if (category === "audio" || ("type" in m && m.type === "audio")) {
        const au = "audioUrl" in m ? m.audioUrl : undefined;
        if (au) {
          return [{ type: "audio", audioUrl: au }];
        }
      } else if (category === "video" || ("type" in m && m.type === "video")) {
        const vu = "videoUrl" in m ? m.videoUrl : undefined;
        if (vu) {
          return [{ type: "video", videoUrl: vu }];
        }
      } else {
        const inputs: MaterialInput[] = [];
        if ("text" in m && m.text) inputs.push({ type: "text", text: m.text });
        if ("imageUrl" in m && m.imageUrl) inputs.push({ type: "image", imageUrl: m.imageUrl });
        return inputs;
      }
      return [];
    });
  }, [selectedMaterials]);

  const handleTransmute = useCallback(
    () => alchemy.transmute(buildMaterialInputs()),
    [alchemy.transmute, buildMaterialInputs],
  );

  const handleCompare = useCallback(
    () => alchemy.compare(buildMaterialInputs()),
    [alchemy.compare, buildMaterialInputs],
  );

  const handlePreview = useCallback(async () => {
    const result = await alchemy.preview(buildMaterialInputs());
    if (!result) throw new Error("Preview failed");
    return result;
  }, [alchemy.preview, buildMaterialInputs]);

  const hasSelection = selectedMaterials.length > 0;

  const previewMaterials = selectedMaterials.map((mat) => ({
    id: mat.id,
    icon: mat.icon,
    label: mat.label,
    imageUrl: "imageUrl" in mat ? mat.imageUrl : undefined,
    text: "text" in mat ? mat.text : undefined,
  }));

  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      headerExtra={<ApiKeyInput />}
      rightWidth={420}
      left={
        <>
          {/* Recipe selector */}
          <div style={{ margin: "16px 0" }}>
            <RecipeSelector
              items={recipeEntries.map((e) => ({
                id: e.recipe.id,
                label: e.label,
                icon: e.icon,
              }))}
              selectedId={selectedRecipeId}
              onSelect={(id) => {
                alchemy.selectRecipe(id);
              }}
            />
          </div>

          {selectedEntry && (
            <div style={{ margin: "4px 0 16px" }}>
              <p style={{ color: "#666", margin: "0 0 12px" }}>{selectedEntry.description}</p>
              <RecipeDetail entry={selectedEntry} />
            </div>
          )}

          {/* Catalyst selector */}
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...labelStyle, margin: 0 }}>Catalyst</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!compareMode) {
                      alchemy.selectCatalyst(null);
                      alchemy.resetResults();
                    }
                  }}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    borderRadius: 14,
                    border:
                      !compareMode && selectedCatalystKey === null
                        ? "2px solid #333"
                        : "1px solid #ccc",
                    background: !compareMode && selectedCatalystKey === null ? "#333" : "#fff",
                    color: !compareMode && selectedCatalystKey === null ? "#fff" : "#555",
                    cursor: "pointer",
                  }}
                >
                  Default
                </button>
                {catalystPresets.map((cat) => {
                  const isSelected = compareMode
                    ? selectedCompareKeys.includes(cat.key)
                    : selectedCatalystKey === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => {
                        if (compareMode) {
                          alchemy.toggleCompareKey(cat.key);
                        } else {
                          alchemy.selectCatalyst(cat.key);
                          alchemy.resetResults();
                        }
                      }}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        borderRadius: 14,
                        border: isSelected ? "2px solid #333" : "1px solid #ccc",
                        background: isSelected ? "#333" : "#fff",
                        color: isSelected ? "#fff" : "#555",
                        cursor: "pointer",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Language</span>
                <LanguageSelect
                  value={selectedLanguage ?? ""}
                  onChange={(v) => alchemy.setLanguage(v || null)}
                />
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={compareMode}
                    onChange={(e) => {
                      const on = e.target.checked;
                      alchemy.setCompareMode(on);
                      alchemy.resetResults();
                      if (on) {
                        alchemy.setCompareKeys(catalystPresets.map((c) => c.key));
                      }
                    }}
                  />
                  Compare
                </label>
              </div>
            </div>
          </div>

          {/* Selected materials preview */}
          <SelectedMaterialsPreview
            materials={previewMaterials}
            emptyMessage={emptyMessage}
            onClear={() => {
              alchemy.clearSelection();
              alchemy.resetResults();
            }}
          />

          {/* Transmute / Compare Button */}
          {compareMode ? (
            <TransmuteButton
              onClick={handleCompare}
              disabled={isLoading || !hasSelection || selectedCompareKeys.length < 2}
              isLoading={isLoading}
              label={isLoading ? undefined : `Compare (${selectedCompareKeys.length} catalysts)`}
            />
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <TransmuteButton
                  onClick={handleTransmute}
                  disabled={isLoading || !hasSelection}
                  isLoading={isLoading}
                />
              </div>
              <div style={{ flex: 1 }}>
                <CopyPromptButton
                  onFetchPreview={handlePreview}
                  disabled={isLoading || !hasSelection}
                />
              </div>
            </div>
          )}

          {/* Single result */}
          <div style={{ marginTop: 24 }}>
            <ResultPanel result={result} isLoading={false} error={error} resultMode={resultMode} />
          </div>

          {/* Compare results */}
          {compareResults != null && (
            <div style={{ marginTop: 24 }}>
              <h2>Comparison</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Object.keys(compareResults).length}, 1fr)`,
                  gap: 12,
                }}
              >
                {Object.entries(compareResults).map(([key, val]) => {
                  const catalystLabel = catalystPresets.find((c) => c.key === key)?.label ?? key;
                  return (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 6,
                        padding: 12,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#555",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {catalystLabel}
                      </div>
                      <ResultPanel
                        result={val}
                        isLoading={false}
                        error={null}
                        resultMode={resultMode}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      }
      right={
        <div style={{ position: "sticky", top: 24, marginTop: 56 }}>
          <MaterialShelf
            presetItems={materials}
            presetGroups={materialGroups as MaterialShelfProps["presetGroups"]}
            customItems={customMaterials.map((c) => ({ ...c, icon: customMaterialIcon(c.type) }))}
            selectedIds={selectedIds}
            onToggle={alchemy.toggleMaterial}
            onAddCustom={addCustomMaterial}
            onDeleteCustom={removeCustomMaterial}
            customMaterialTypes={customMaterialTypes}
          />
          {selectedIds.size > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#999", textAlign: "center" }}>
              {selectedIds.size} selected
            </div>
          )}
        </div>
      }
    />
  );
}
