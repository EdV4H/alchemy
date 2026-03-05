import type { MaterialPartType, MaterialRequirement } from "@edv4h/alchemy-node";
import { validateMaterialRequirements } from "@edv4h/alchemy-node";
import { useCallback, useState } from "react";
import { ApiKeyInput } from "../shared/ApiKeyInput.js";
import { CopyPromptButton } from "../shared/CopyPromptButton.js";
import {
  GenerateCountStepper,
  LanguageSelect,
  MaterialShelf,
  ModeSelector,
  PageShell,
  ResultPanel,
  SelectedMaterialsPreview,
  TransmuteButton,
  type TransmuteMode,
  VariationResultsGrid,
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
import { AVAILABLE_TRANSFORMS, findSampleValidator, SAMPLE_VALIDATORS } from "./constants.js";
import { RecipeManager } from "./RecipeManager.js";
import { usePlaygroundStore } from "./usePlaygroundStore.js";
import { usePlaygroundTransmute } from "./usePlaygroundTransmute.js";

export function App() {
  const store = usePlaygroundStore();
  const { headers } = useApiKeyStore();
  const { transmute, generate, preview, result, generateResults, isLoading, error, reset } =
    usePlaygroundTransmute({ headers });

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(store.recipes[0]?.id ?? "");
  const [selectedCatalystId, setSelectedCatalystId] = useState<string | null>(
    store.catalysts[0]?.id ?? null,
  );
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [generateMode, setGenerateMode] = useState(false);
  const [generateCount, setGenerateCount] = useState(3);
  const [selectedVariationKey, setSelectedVariationKey] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const currentMode: TransmuteMode = generateMode ? "generate" : "single";

  const handleModeChange = useCallback(
    (mode: TransmuteMode) => {
      reset();
      setSelectedVariationKey(null);
      setGenerateMode(mode === "generate");
    },
    [reset],
  );

  // Playground only supports Single and Generate modes (no Compare)
  const playgroundModes: TransmuteMode[] = ["single", "generate"];

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

  const validatePlaygroundMaterials = useCallback((): boolean => {
    if (!selectedRecipe) return true;
    const hasReqs = selectedRecipe.requiredMaterials?.length;
    const hasValidator = selectedRecipe.validateMaterialsKey;
    if (!hasReqs && !hasValidator) return true;

    const materials = store.materials.filter((m) => selectedMaterialIds.has(m.id));
    // Build fake MaterialPart-like objects for validation
    const fakeParts = materials.map((m) => {
      if (m.type === "text") return { type: "text" as const, text: m.text ?? "" };
      return { type: m.type };
    }) as import("@edv4h/alchemy-node").MaterialPart[];

    // 1. Declarative check
    if (hasReqs) {
      const result = validateMaterialRequirements(
        selectedRecipe.requiredMaterials ?? [],
        fakeParts,
      );
      if (!result.valid) {
        const msg =
          result.issues
            ?.map((i) => {
              const label = i.label ?? i.type;
              return i.kind === "too_few"
                ? `Requires at least ${i.requirement.min} ${label} (got ${i.actual})`
                : `At most ${i.requirement.max} ${label} allowed (got ${i.actual})`;
            })
            .join("; ") ?? "Validation failed";
        setLocalError(msg);
        return false;
      }
    }

    // 2. Sample validator check
    if (hasValidator) {
      const validator = findSampleValidator(hasValidator);
      if (validator) {
        const result = validator.validate(fakeParts);
        if (!result.valid) {
          setLocalError(result.message ?? "Custom validation failed");
          return false;
        }
      }
    }

    setLocalError(null);
    return true;
  }, [selectedRecipe, store.materials, selectedMaterialIds]);

  const handleTransmute = useCallback(() => {
    if (!selectedRecipe) return;
    const materials = store.materials.filter((m) => selectedMaterialIds.has(m.id));
    if (materials.length === 0) return;
    if (!validatePlaygroundMaterials()) return;
    setLocalError(null);

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
    validatePlaygroundMaterials,
  ]);

  const handleGenerate = useCallback(() => {
    if (!selectedRecipe) return;
    const materials = store.materials.filter((m) => selectedMaterialIds.has(m.id));
    if (materials.length === 0) return;
    if (!validatePlaygroundMaterials()) return;
    setLocalError(null);

    setSelectedVariationKey(null);
    generate({
      materials,
      promptTemplate: selectedRecipe.promptTemplate,
      outputType: selectedRecipe.outputType,
      transforms: selectedRecipe.transforms,
      catalyst: selectedCatalyst ?? undefined,
      language: selectedLanguage || undefined,
      count: generateCount,
    });
  }, [
    selectedRecipe,
    selectedCatalyst,
    selectedLanguage,
    generateCount,
    store.materials,
    selectedMaterialIds,
    generate,
    validatePlaygroundMaterials,
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

              {/* Required Materials */}
              <div>
                <div style={{ ...labelStyle, marginBottom: 2 }}>Required Materials</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
                  送信時にバリデーションするタイプと個数の宣言
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(selectedRecipe.requiredMaterials ?? []).map((req, i) => {
                    const reqKey = `req-${i.toString()}-${req.type}`;
                    return (
                      <div key={reqKey} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <select
                          value={req.type}
                          onChange={(e) => {
                            const updated = [...(selectedRecipe.requiredMaterials ?? [])];
                            updated[i] = {
                              ...updated[i],
                              type: e.target.value as MaterialPartType,
                            };
                            store.updateRecipe(selectedRecipe.id, { requiredMaterials: updated });
                          }}
                          style={{ ...selectStyle, width: 110 }}
                        >
                          {(
                            [
                              "text",
                              "image",
                              "audio",
                              "document",
                              "video",
                              "data",
                            ] as MaterialPartType[]
                          ).map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 11, color: "#999" }}>min</span>
                          <input
                            type="number"
                            value={req.min ?? 1}
                            min={0}
                            onChange={(e) => {
                              const updated = [...(selectedRecipe.requiredMaterials ?? [])];
                              updated[i] = { ...updated[i], min: Number(e.target.value) || 0 };
                              store.updateRecipe(selectedRecipe.id, { requiredMaterials: updated });
                            }}
                            style={{ ...inputStyle, width: 50, textAlign: "center" }}
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 11, color: "#999" }}>max</span>
                          <input
                            type="number"
                            value={req.max ?? ""}
                            min={0}
                            placeholder="∞"
                            onChange={(e) => {
                              const updated = [...(selectedRecipe.requiredMaterials ?? [])];
                              const val = e.target.value ? Number(e.target.value) : undefined;
                              updated[i] = { ...updated[i], max: val };
                              store.updateRecipe(selectedRecipe.id, { requiredMaterials: updated });
                            }}
                            style={{ ...inputStyle, width: 50, textAlign: "center" }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (selectedRecipe.requiredMaterials ?? []).filter(
                              (_, j) => j !== i,
                            );
                            store.updateRecipe(selectedRecipe.id, {
                              requiredMaterials: updated.length > 0 ? updated : undefined,
                            });
                          }}
                          style={{ ...deleteButtonStyle, fontSize: 12, padding: 0 }}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedRecipe.requiredMaterials ?? [];
                      const newReq: MaterialRequirement = { type: "text", min: 1 };
                      store.updateRecipe(selectedRecipe.id, {
                        requiredMaterials: [...current, newReq],
                      });
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: 11,
                      border: "1px dashed #ccc",
                      borderRadius: 4,
                      background: "#fff",
                      color: "#888",
                      cursor: "pointer",
                      alignSelf: "flex-start",
                    }}
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              {/* Custom Validator */}
              <div>
                <div style={{ ...labelStyle, marginBottom: 2 }}>Custom Validator</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
                  送信時に素材の内容を検証するサンプルバリデーター
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <select
                    value={selectedRecipe.validateMaterialsKey ?? ""}
                    onChange={(e) => {
                      store.updateRecipe(selectedRecipe.id, {
                        validateMaterialsKey: e.target.value || undefined,
                      });
                    }}
                    style={selectStyle}
                  >
                    <option value="">None</option>
                    {SAMPLE_VALIDATORS.map((v) => (
                      <option key={v.key} value={v.key}>
                        {v.label} — {v.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Mode + Catalyst + Language */}
          <div style={{ margin: "0 0 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <ModeSelector
                mode={currentMode}
                onChange={handleModeChange}
                availableModes={playgroundModes}
              />
              {generateMode && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Count</span>
                  <GenerateCountStepper
                    count={generateCount}
                    onChange={(c) => setGenerateCount(Math.max(2, Math.min(5, c)))}
                  />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Language</span>
                <LanguageSelect value={selectedLanguage} onChange={setSelectedLanguage} />
              </div>
            </div>
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

          {generateMode ? (
            <TransmuteButton
              onClick={handleGenerate}
              disabled={isLoading || !hasSelectedMaterials || !selectedRecipe}
              isLoading={isLoading}
              label={isLoading ? undefined : `Generate ${generateCount} Variations`}
            />
          ) : (
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
          )}

          <ResultPanel result={result} isLoading={isLoading} error={localError ?? error} />

          {generateResults != null && (
            <VariationResultsGrid
              results={generateResults}
              selectedKey={selectedVariationKey}
              onPick={setSelectedVariationKey}
            />
          )}
        </div>
      }
      right={
        <MaterialShelf
          customItems={materialsWithIcons}
          selectedIds={selectedMaterialIds}
          onToggle={toggleMaterial}
          onAddCustom={(m) => {
            store.addMaterial(m);
            setSelectedMaterialIds((prev) => new Set([...prev, m.id]));
          }}
          onDeleteCustom={handleDeleteMaterial}
        />
      }
    />
  );
}
