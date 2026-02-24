import type { NamedCatalyst } from "@EdV4H/alchemy-node";
import type { MaterialInput } from "@EdV4H/alchemy-react";
import { useAlchemy } from "@EdV4H/alchemy-react";
import { useCallback, useState } from "react";
import type { RecipeEntry } from "../../shared/recipes.js";
import {
  CustomAudioForm,
  CustomDataForm,
  CustomDocumentForm,
  CustomImageForm,
  CustomTextForm,
  CustomVideoForm,
  RecipeInfoPopover,
} from "./components.js";
import { codeStyle, labelStyle } from "./styles.js";
import type { CustomMaterial, MaterialCard } from "./types.js";

// ─── Config ──────────────────────────────────────────────────────────────────

type CustomMaterialType = "text" | "image" | "data" | "document" | "audio" | "video";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_CUSTOM_TYPES: CustomMaterialType[] = [
  "text",
  "image",
  "data",
  "document",
  "audio",
  "video",
];

const CUSTOM_TYPE_LABELS: Record<CustomMaterialType, string> = {
  text: "+ Text",
  image: "+ Image",
  data: "+ Data",
  document: "+ Doc",
  audio: "+ Audio",
  video: "+ Video",
};

function customMaterialIcon(type: CustomMaterial["type"]): string {
  switch (type) {
    case "data":
      return "\uD83D\uDCCA";
    case "document":
      return "\uD83D\uDCC4";
    case "audio":
      return "\uD83C\uDFA7";
    case "video":
      return "\uD83C\uDFAC";
    case "image":
      return "\uD83D\uDDBC\uFE0F";
    default:
      return "\uD83D\uDCDD";
  }
}

const CUSTOM_FORM_MAP: Record<
  CustomMaterialType,
  React.ComponentType<{ onAdd: (m: CustomMaterial) => void; onCancel: () => void }>
> = {
  text: CustomTextForm,
  image: CustomImageForm,
  data: CustomDataForm,
  document: CustomDocumentForm,
  audio: CustomAudioForm,
  video: CustomVideoForm,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AlchemyDemoApp({
  title,
  subtitle,
  emptyMessage = "Select materials from the shelf",
  materials,
  recipeEntries,
  catalystPresets,
  materialGroups,
  customMaterialTypes = ALL_CUSTOM_TYPES,
  resultMode = "text",
}: AlchemyDemoConfig) {
  const alchemy = useAlchemy({ initialRecipeId: recipeEntries[0].recipe.id });
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [showForm, setShowForm] = useState<CustomMaterialType | null>(null);
  const [infoPopoverId, setInfoPopoverId] = useState<string | null>(null);

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
    setShowForm(null);
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

  const hasSelection = selectedMaterials.length > 0;

  const gridCols =
    customMaterialTypes.length <= 4 ? `repeat(${customMaterialTypes.length}, 1fr)` : "1fr 1fr 1fr";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Left: Recipe + Transmute */}
        <div>
          <h1>{title}</h1>
          {subtitle && (
            <p style={{ color: "#888", marginTop: -8, marginBottom: 16, fontSize: 14 }}>
              {subtitle}
            </p>
          )}

          {/* Recipe selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
            {recipeEntries.map((entry) => {
              const active = entry.recipe.id === selectedRecipeId;
              return (
                <button
                  type="button"
                  key={entry.recipe.id}
                  onClick={() => {
                    alchemy.selectRecipe(entry.recipe.id);
                    setInfoPopoverId(null);
                  }}
                  style={{
                    padding: "6px 14px",
                    fontSize: 14,
                    borderRadius: 20,
                    border: active ? "2px solid #333" : "1px solid #ccc",
                    background: active ? "#333" : "#fff",
                    color: active ? "#fff" : "#333",
                    cursor: "pointer",
                  }}
                >
                  {entry.icon} {entry.label}
                </button>
              );
            })}
          </div>

          {selectedEntry && (
            <div style={{ position: "relative", margin: "4px 0 16px" }}>
              <p style={{ color: "#666", margin: 0, display: "inline" }}>
                {selectedEntry.description}
              </p>
              <button
                type="button"
                onClick={() =>
                  setInfoPopoverId(
                    infoPopoverId === selectedEntry.recipe.id ? null : selectedEntry.recipe.id,
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "0 0 0 6px",
                  verticalAlign: "baseline",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 2,
                }}
              >
                details
              </button>
              {infoPopoverId === selectedEntry.recipe.id && (
                <RecipeInfoPopover entry={selectedEntry} onClose={() => setInfoPopoverId(null)} />
              )}
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
                <select
                  value={selectedLanguage ?? ""}
                  onChange={(e) => alchemy.setLanguage(e.target.value || null)}
                  style={{
                    padding: "3px 6px",
                    fontSize: 12,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Auto</option>
                  <option value="English">English</option>
                  <option value="Japanese">日本語</option>
                  <option value="Chinese">中文</option>
                  <option value="Korean">한국어</option>
                </select>
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
          {hasSelection ? (
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={labelStyle}>Materials ({selectedMaterials.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    alchemy.clearSelection();
                    alchemy.resetResults();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  Clear all
                </button>
              </div>
              {selectedMaterials.map((mat) => {
                const imageUrl = "imageUrl" in mat ? mat.imageUrl : undefined;
                const text = "text" in mat ? mat.text : undefined;
                return (
                  <div key={mat.id} style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {mat.icon} {mat.label}
                    </div>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Material"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 140,
                          borderRadius: 4,
                          border: "1px solid #e0e0e0",
                          marginBottom: 6,
                          display: "block",
                        }}
                      />
                    )}
                    {text && (
                      <pre style={{ ...codeStyle, margin: 0, maxHeight: 80, fontSize: 12 }}>
                        {text}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed #ccc",
                borderRadius: 6,
                padding: "28px 16px",
                textAlign: "center",
                color: "#aaa",
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {emptyMessage} &rarr;
            </div>
          )}

          {/* Transmute / Compare Button */}
          {compareMode ? (
            <button
              type="button"
              onClick={handleCompare}
              disabled={isLoading || !hasSelection || selectedCompareKeys.length < 2}
              style={{ marginTop: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
            >
              {isLoading ? "Comparing..." : `Compare (${selectedCompareKeys.length} catalysts)`}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTransmute}
              disabled={isLoading || !hasSelection}
              style={{ marginTop: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
            >
              {isLoading ? "Transmuting..." : "Transmute"}
            </button>
          )}

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

          {/* Single result */}
          {result != null && (
            <div style={{ marginTop: 24 }}>
              <h2>Result</h2>
              {typeof result === "string" ? (
                resultMode === "html" ? (
                  <>
                    <div
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 6,
                        padding: 16,
                        marginBottom: 12,
                      }}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML rendering from LLM output
                      dangerouslySetInnerHTML={{ __html: result }}
                    />
                    <details>
                      <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>
                        View HTML Source
                      </summary>
                      <pre style={{ ...codeStyle, marginTop: 8, fontSize: 12 }}>{result}</pre>
                    </details>
                  </>
                ) : (
                  <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
                )
              ) : (
                <pre style={codeStyle}>{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}

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
                      {typeof val === "string" ? (
                        resultMode === "html" ? (
                          <>
                            <div
                              style={{ fontSize: 13 }}
                              // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML rendering from LLM output
                              dangerouslySetInnerHTML={{ __html: val }}
                            />
                            <details style={{ marginTop: 8 }}>
                              <summary style={{ cursor: "pointer", fontSize: 11, color: "#aaa" }}>
                                HTML Source
                              </summary>
                              <pre
                                style={{
                                  ...codeStyle,
                                  margin: "4px 0 0",
                                  fontSize: 10,
                                  maxHeight: 200,
                                }}
                              >
                                {val}
                              </pre>
                            </details>
                          </>
                        ) : (
                          <p style={{ whiteSpace: "pre-wrap", fontSize: 13, margin: 0 }}>{val}</p>
                        )
                      ) : (
                        <pre style={{ ...codeStyle, margin: 0, fontSize: 12 }}>
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Material Shelf */}
        <div
          style={{
            position: "sticky",
            top: 24,
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            padding: 16,
            marginTop: 56,
          }}
        >
          <div style={{ ...labelStyle, marginBottom: 12 }}>Material Shelf</div>

          {/* Grouped or flat material grid */}
          {materialGroups ? (
            materialGroups.map((group) => {
              const items = materials.filter(group.filter);
              if (items.length === 0) return null;
              return (
                <div key={group.header} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#999",
                      marginBottom: 6,
                      paddingBottom: 2,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {group.header}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {items.map((mat) => {
                      const active = selectedIds.has(mat.id);
                      return (
                        <button
                          type="button"
                          key={mat.id}
                          onClick={() => alchemy.toggleMaterial(mat.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 8px",
                            background: active ? "#f0f0f0" : "#fff",
                            border: active ? "2px solid #333" : "1px solid #e0e0e0",
                            borderRadius: 6,
                            cursor: "pointer",
                            color: "#333",
                            textAlign: "left",
                            fontSize: 12,
                            overflow: "hidden",
                          }}
                        >
                          <span style={{ fontSize: 14, flexShrink: 0 }}>{mat.icon}</span>
                          <span
                            style={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {mat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {materials.map((mat) => {
                const active = selectedIds.has(mat.id);
                return (
                  <button
                    type="button"
                    key={mat.id}
                    onClick={() => alchemy.toggleMaterial(mat.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 8px",
                      background: active ? "#f0f0f0" : "#fff",
                      border: active ? "2px solid #333" : "1px solid #e0e0e0",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#333",
                      textAlign: "left",
                      fontSize: 12,
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{mat.icon}</span>
                    <span
                      style={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {mat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom materials */}
          {customMaterials.length > 0 && (
            <>
              <div style={{ ...labelStyle, marginTop: 16, marginBottom: 8 }}>Custom</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {customMaterials.map((mat) => {
                  const active = selectedIds.has(mat.id);
                  return (
                    <div key={mat.id} style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => alchemy.toggleMaterial(mat.id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 8px",
                          background: active ? "#f0f0f0" : "#fff",
                          border: active ? "2px solid #333" : "1px solid #e0e0e0",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#333",
                          textAlign: "left",
                          fontSize: 12,
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>
                          {customMaterialIcon(mat.type)}
                        </span>
                        <span
                          style={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {mat.label}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomMaterial(mat.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "0 2px",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Add custom material buttons */}
          <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 5 }}>
              {customMaterialTypes.map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setShowForm(showForm === key ? null : key)}
                  style={{
                    padding: "5px 6px",
                    fontSize: 11,
                    cursor: "pointer",
                    background: showForm === key ? "#f0f0f0" : "#fff",
                    border: showForm === key ? "1px solid #999" : "1px solid #ddd",
                    borderRadius: 4,
                    color: "#555",
                  }}
                >
                  {CUSTOM_TYPE_LABELS[key]}
                </button>
              ))}
            </div>
            {showForm != null &&
              customMaterialTypes.includes(showForm) &&
              (() => {
                const FormComponent = CUSTOM_FORM_MAP[showForm];
                return (
                  <FormComponent onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
                );
              })()}
          </div>

          {selectedIds.size > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#999", textAlign: "center" }}>
              {selectedIds.size} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
