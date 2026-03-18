import type { MaterialPart } from "@edv4h/alchemy-node";
import { runMaterialValidation, toMaterialParts } from "@edv4h/alchemy-node";
import type { MaterialInput } from "@edv4h/alchemy-react";
import { useAlchemy } from "@edv4h/alchemy-react";
import { useCallback, useState } from "react";
import type { RecipeEntry } from "../../shared/recipes.js";
import { ApiKeyInput } from "./ApiKeyInput.js";
import { CopyPromptButton } from "./CopyPromptButton.js";
import {
  GenerateCountStepper,
  LanguageSelect,
  MaterialShelf,
  type MaterialShelfProps,
  ModeSelector,
  PageShell,
  RecipeDetail,
  RecipeSelector,
  ResultPanel,
  SelectedMaterialsPreview,
  TransmuteButton,
  type TransmuteMode,
  VariationResultsGrid,
} from "./components.js";
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
  materialGroups?: { header: string; filter: (m: MaterialCard) => boolean }[];
  customMaterialTypes?: CustomMaterialType[];
  resultMode?: "text" | "html" | "mermaid";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AlchemyDemoApp({
  title,
  subtitle,
  emptyMessage = "Select materials from the shelf",
  materials,
  recipeEntries,
  materialGroups,
  customMaterialTypes,
  resultMode = "text",
}: AlchemyDemoConfig) {
  const { headers } = useApiKeyStore();
  const alchemy = useAlchemy({ initialRecipeId: recipeEntries[0].recipe.id, headers });
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    selectedRecipeId,
    selectedIds,
    selectedLanguage,
    generateMode,
    generateCount,
    generateResults,
    selectedVariationKey,
    result,
    isLoading,
    error,
  } = alchemy;

  const selectedEntry = recipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  const effectiveResultMode = selectedEntry?.meta.outputType === "mermaid" ? "mermaid" : resultMode;

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

  const validateBeforeSubmit = useCallback(async (): Promise<boolean> => {
    if (!selectedEntry) return true;
    const recipe = selectedEntry.recipe;
    if (!recipe.requiredMaterials && !recipe.validateMaterials) return true;

    const inputs = buildMaterialInputs();
    const parts = toMaterialParts(inputs) as MaterialPart[];
    const result = await runMaterialValidation(recipe, parts);
    if (!result.valid) {
      const msg =
        result.message ??
        result.issues
          ?.map((i) => {
            const label = i.label ?? i.type;
            return i.kind === "too_few"
              ? `Requires at least ${i.requirement.min} ${label} (got ${i.actual})`
              : `At most ${i.requirement.max} ${label} allowed (got ${i.actual})`;
          })
          .join("; ") ??
        "Validation failed";
      setLocalError(msg);
      return false;
    }
    setLocalError(null);
    return true;
  }, [selectedEntry, buildMaterialInputs]);

  const handleTransmute = useCallback(async () => {
    if (!(await validateBeforeSubmit())) return;
    setLocalError(null);
    alchemy.transmute(buildMaterialInputs());
  }, [alchemy.transmute, buildMaterialInputs, validateBeforeSubmit]);

  const handleGenerate = useCallback(async () => {
    if (!(await validateBeforeSubmit())) return;
    setLocalError(null);
    alchemy.generate(buildMaterialInputs());
  }, [alchemy.generate, buildMaterialInputs, validateBeforeSubmit]);

  const handlePreview = useCallback(async () => {
    const result = await alchemy.preview(buildMaterialInputs());
    if (!result) throw new Error("Preview failed");
    return result;
  }, [alchemy.preview, buildMaterialInputs]);

  const currentMode: TransmuteMode = generateMode ? "generate" : "single";

  const handleModeChange = useCallback(
    (mode: TransmuteMode) => {
      alchemy.resetResults();
      if (mode === "generate") {
        alchemy.setGenerateMode(true);
      } else {
        alchemy.setGenerateMode(false);
      }
    },
    [alchemy.resetResults, alchemy.setGenerateMode],
  );

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

          {/* Mode selector */}
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
              <ModeSelector mode={currentMode} onChange={handleModeChange} />
              {generateMode && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Count</span>
                  <GenerateCountStepper count={generateCount} onChange={alchemy.setGenerateCount} />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Language</span>
                <LanguageSelect
                  value={selectedLanguage ?? ""}
                  onChange={(v) => alchemy.setLanguage(v || null)}
                />
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

          {/* Transmute / Generate Button */}
          {generateMode ? (
            <TransmuteButton
              onClick={handleGenerate}
              disabled={isLoading || !hasSelection}
              isLoading={isLoading}
              label={isLoading ? undefined : `Generate ${generateCount} Variations`}
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
          {!generateMode && (
            <div style={{ marginTop: 24 }}>
              <ResultPanel
                result={result}
                isLoading={false}
                error={localError ?? error}
                resultMode={effectiveResultMode}
              />
            </div>
          )}

          {/* Generate results */}
          {generateResults != null && (
            <VariationResultsGrid
              results={generateResults}
              selectedKey={selectedVariationKey}
              onPick={alchemy.selectVariation}
              resultMode={effectiveResultMode}
            />
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
