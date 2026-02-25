import type React from "react";
import { useState } from "react";
import type { RecipeEntry, RecipeFieldMeta } from "../../shared/recipes.js";
import {
  cardStyle,
  codeStyle,
  deleteButtonStyle,
  fieldLabelStyle,
  fieldWrapperStyle,
  inputStyle,
  labelStyle,
  popoverSectionLabel,
  primaryButtonStyle,
  secondaryButtonStyle,
  selectStyle,
  textareaStyle,
} from "./styles.js";
import type { CustomMaterial, CustomMaterialType } from "./types.js";
import { CUSTOM_TYPE_LABELS, customMaterialIcon } from "./types.js";

// ─── Custom Material Forms ──────────────────────────────────────────────────

interface CustomFormField {
  key: string;
  label: string;
  type: "input" | "textarea" | "select";
  placeholder?: string;
  rows?: number;
  monospace?: boolean;
  options?: { value: string; label: string }[];
}

interface CustomFormConfig {
  materialType: CustomMaterial["type"];
  defaultLabel: string;
  fields: CustomFormField[];
  buildMaterial: (id: string, label: string, values: Record<string, string>) => CustomMaterial;
  validate: (values: Record<string, string>) => boolean;
}

function CustomMaterialForm({
  config,
  onAdd,
  onCancel,
}: {
  config: CustomFormConfig;
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.fields.map((f) => [f.key, f.options?.[0]?.value ?? ""])),
  );

  const setValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={cardStyle}>
      <div style={fieldWrapperStyle}>
        <div style={fieldLabelStyle}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`My ${config.materialType}`}
          style={inputStyle}
        />
      </div>
      {config.fields.map((field) => (
        <div key={field.key} style={fieldWrapperStyle}>
          <div style={fieldLabelStyle}>{field.label}</div>
          {field.type === "textarea" ? (
            <textarea
              value={values[field.key]}
              onChange={(e) => setValue(field.key, e.target.value)}
              rows={field.rows ?? 3}
              placeholder={field.placeholder}
              style={{ ...textareaStyle, ...(field.monospace ? { fontFamily: "monospace" } : {}) }}
            />
          ) : field.type === "select" ? (
            <select
              value={values[field.key]}
              onChange={(e) => setValue(field.key, e.target.value)}
              style={selectStyle}
            >
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={values[field.key]}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => {
            if (!config.validate(values)) return;
            const id = `custom-${config.materialType}-${Date.now()}`;
            onAdd(config.buildMaterial(id, label.trim() || config.defaultLabel, values));
          }}
          style={primaryButtonStyle}
        >
          Add
        </button>
        <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const FORM_CONFIGS: Record<CustomMaterialType, CustomFormConfig> = {
  text: {
    materialType: "text",
    defaultLabel: "Custom Text",
    fields: [{ key: "text", label: "Text", type: "textarea", placeholder: "Enter your text..." }],
    validate: (v) => !!v.text?.trim(),
    buildMaterial: (id, label, v) => ({ id, label, type: "text", text: v.text.trim() }),
  },
  image: {
    materialType: "image",
    defaultLabel: "Custom Image",
    fields: [
      { key: "prompt", label: "Prompt", type: "input", placeholder: "Describe what to analyze..." },
      { key: "url", label: "Image URL", type: "input", placeholder: "https://..." },
    ],
    validate: (v) => !!v.url?.trim(),
    buildMaterial: (id, label, v) => ({
      id,
      label,
      type: "image",
      text: v.prompt.trim() || undefined,
      imageUrl: v.url.trim(),
    }),
  },
  data: {
    materialType: "data",
    defaultLabel: "Custom Data",
    fields: [
      {
        key: "format",
        label: "Format",
        type: "select",
        options: [
          { value: "csv", label: "CSV" },
          { value: "json", label: "JSON" },
          { value: "tsv", label: "TSV" },
        ],
      },
      {
        key: "content",
        label: "Content",
        type: "textarea",
        rows: 4,
        placeholder: "Paste your data...",
        monospace: true,
      },
    ],
    validate: (v) => !!v.content?.trim(),
    buildMaterial: (id, label, v) => ({
      id,
      label,
      type: "data",
      dataFormat: v.format as "csv" | "json" | "tsv",
      dataContent: v.content.trim(),
    }),
  },
  document: {
    materialType: "document",
    defaultLabel: "Custom Document",
    fields: [
      {
        key: "text",
        label: "Document text",
        type: "textarea",
        rows: 5,
        placeholder: "Paste your document text...",
      },
    ],
    validate: (v) => !!v.text?.trim(),
    buildMaterial: (id, label, v) => ({
      id,
      label,
      type: "document",
      documentText: v.text.trim(),
    }),
  },
  audio: {
    materialType: "audio",
    defaultLabel: "Custom Audio",
    fields: [{ key: "url", label: "Audio URL", type: "input", placeholder: "https://...mp3" }],
    validate: (v) => !!v.url?.trim(),
    buildMaterial: (id, label, v) => ({ id, label, type: "audio", audioUrl: v.url.trim() }),
  },
  video: {
    materialType: "video",
    defaultLabel: "Custom Video",
    fields: [{ key: "url", label: "Video URL", type: "input", placeholder: "https://...mp4" }],
    validate: (v) => !!v.url?.trim(),
    buildMaterial: (id, label, v) => ({ id, label, type: "video", videoUrl: v.url.trim() }),
  },
};

// ─── Material Shelf ────────────────────────────────────────────────────────

export interface MaterialShelfItem {
  id: string;
  icon: string;
  label: string;
}

const ALL_CUSTOM_TYPES: CustomMaterialType[] = [
  "text",
  "image",
  "data",
  "document",
  "audio",
  "video",
];

export interface MaterialShelfProps {
  presetItems?: MaterialShelfItem[];
  presetGroups?: { header: string; filter: (item: MaterialShelfItem) => boolean }[];
  customItems: (CustomMaterial & { icon: string })[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onAddCustom: (m: CustomMaterial) => void;
  onDeleteCustom: (id: string) => void;
  customMaterialTypes?: CustomMaterialType[];
}

export function MaterialShelf({
  presetItems,
  presetGroups,
  customItems,
  selectedIds,
  onToggle,
  onAddCustom,
  onDeleteCustom,
  customMaterialTypes = ALL_CUSTOM_TYPES,
}: MaterialShelfProps) {
  const [showForm, setShowForm] = useState<CustomMaterialType | null>(null);

  const gridCols =
    customMaterialTypes.length <= 4 ? `repeat(${customMaterialTypes.length}, 1fr)` : "1fr 1fr 1fr";

  const renderItemButton = (item: MaterialShelfItem, active: boolean) => (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
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
      <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
      <span
        style={{
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </span>
    </button>
  );

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 16 }}>
      <div style={{ ...labelStyle, marginBottom: 12 }}>Materials</div>

      {/* Preset items (grouped or flat) */}
      {presetItems &&
        presetItems.length > 0 &&
        (presetGroups ? (
          presetGroups.map((group) => {
            const items = presetItems.filter(group.filter);
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
                  {items.map((mat) => (
                    <div key={mat.id}>{renderItemButton(mat, selectedIds.has(mat.id))}</div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {presetItems.map((mat) => (
              <div key={mat.id}>{renderItemButton(mat, selectedIds.has(mat.id))}</div>
            ))}
          </div>
        ))}

      {/* No materials message (only when no presets and no custom) */}
      {(!presetItems || presetItems.length === 0) && customItems.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: "#aaa",
            padding: "12px 0",
            textAlign: "center",
          }}
        >
          No materials yet
        </div>
      )}

      {/* Custom items */}
      {customItems.length > 0 && (
        <>
          {presetItems && presetItems.length > 0 && (
            <div style={{ ...labelStyle, marginTop: 16, marginBottom: 8 }}>Custom</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {customItems.map((mat) => {
              const active = selectedIds.has(mat.id);
              return (
                <div key={mat.id} style={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {renderItemButton(
                    { id: mat.id, icon: customMaterialIcon(mat.type), label: mat.label },
                    active,
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteCustom(mat.id)}
                    style={{ ...deleteButtonStyle, flexShrink: 0 }}
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
        {showForm != null && customMaterialTypes.includes(showForm) && (
          <CustomMaterialForm
            config={FORM_CONFIGS[showForm]}
            onAdd={(m) => {
              onAddCustom(m);
              setShowForm(null);
            }}
            onCancel={() => setShowForm(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── List Selection Helper ──────────────────────────────────────────────────

/** Handle delete with auto-fallback: if deleted item is selected, select next remaining. */
export function handleDeleteWithFallback<T extends { id: string }>(
  items: T[],
  deletedId: string,
  selectedId: string | null,
  onDelete: (id: string) => void,
  onSelect: (id: string | null) => void,
) {
  onDelete(deletedId);
  if (selectedId === deletedId) {
    const remaining = items.filter((item) => item.id !== deletedId);
    onSelect(remaining.length > 0 ? remaining[0].id : null);
  }
}

// ─── Recipe Selector ────────────────────────────────────────────────────────

export interface RecipeSelectorItem {
  id: string;
  label: string;
  icon?: string;
}

export interface RecipeSelectorProps {
  items: RecipeSelectorItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  minItems?: number;
}

export function RecipeSelector({
  items,
  selectedId,
  onSelect,
  onDelete,
  onAdd,
  minItems = 1,
}: RecipeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <div key={item.id} style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
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
              {item.icon ? `${item.icon} ${item.label}` : item.label}
            </button>
            {onDelete && items.length > minItems && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                style={{ ...deleteButtonStyle, marginLeft: 2 }}
                title="Delete"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: "6px 14px",
            fontSize: 14,
            borderRadius: 20,
            border: "1px dashed #ccc",
            background: "#fff",
            color: "#888",
            cursor: "pointer",
          }}
        >
          + New
        </button>
      )}
    </div>
  );
}

// ─── Recipe Info Detail ─────────────────────────────────────────────────────

export function FieldRow({ field, depth = 0 }: { field: RecipeFieldMeta; depth?: number }) {
  return (
    <>
      <div style={{ display: "flex", gap: 6, paddingLeft: depth * 14, lineHeight: 1.5 }}>
        <code style={{ fontSize: 12, color: "#333" }}>{field.name}</code>
        <span style={{ fontSize: 12, color: "#999" }}>{field.type}</span>
      </div>
      {field.children?.map((child) => (
        <FieldRow key={child.name} field={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function RecipeDetail({ entry }: { entry: RecipeEntry }) {
  const { meta } = entry;
  const catalyst = entry.recipe.catalyst;

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        padding: 14,
        fontSize: 13,
        color: "#333",
      }}
    >
      {/* OUTPUT */}
      <div style={{ marginBottom: 10 }}>
        <div style={popoverSectionLabel}>Output</div>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 4,
            background: meta.outputType === "json" ? "#e8f5e9" : "#e3f2fd",
            color: meta.outputType === "json" ? "#2e7d32" : "#1565c0",
          }}
        >
          {meta.outputType}
        </span>
      </div>

      {/* SCHEMA */}
      {meta.schemaFields && meta.schemaFields.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={popoverSectionLabel}>Schema</div>
          <div
            style={{
              background: "#f9f9f9",
              borderRadius: 4,
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {meta.schemaFields.map((field) => (
              <FieldRow key={field.name} field={field} />
            ))}
          </div>
        </div>
      )}

      {/* CATALYST */}
      {catalyst && (
        <div style={{ marginBottom: 10 }}>
          <div style={popoverSectionLabel}>Catalyst</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            <div>
              <span style={{ color: "#999" }}>role: </span>
              {catalyst.roleDefinition && catalyst.roleDefinition.length > 80
                ? `${catalyst.roleDefinition.slice(0, 80)}...`
                : catalyst.roleDefinition}
            </div>
            {catalyst.temperature !== undefined && (
              <div>
                <span style={{ color: "#999" }}>temperature: </span>
                {catalyst.temperature}
              </div>
            )}
            {catalyst.model && (
              <div>
                <span style={{ color: "#999" }}>model: </span>
                {catalyst.model}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRANSFORMS */}
      <div style={{ marginBottom: 10 }}>
        <div style={popoverSectionLabel}>Transforms</div>
        {meta.transforms.length > 0 ? (
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#555" }}>
            {meta.transforms.map((t) => (
              <li key={t}>
                <code style={{ fontSize: 12 }}>{t}</code>
              </li>
            ))}
          </ol>
        ) : (
          <div style={{ fontSize: 12, color: "#aaa" }}>None</div>
        )}
      </div>

      {/* PROMPT */}
      <div>
        <div style={popoverSectionLabel}>Prompt Template</div>
        <pre
          style={{
            background: "#f5f5f5",
            borderRadius: 4,
            padding: "6px 8px",
            fontSize: 11,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
            color: "#555",
          }}
        >
          {meta.promptTemplate}
        </pre>
      </div>
    </div>
  );
}

// ─── Page Shell ─────────────────────────────────────────────────────────────

export function PageShell({
  title,
  subtitle,
  rightWidth = 400,
  maxWidth = 1280,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  rightWidth?: number;
  maxWidth?: number;
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gridTemplateColumns: `1fr ${rightWidth}px`,
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 4px" }}>{title}</h1>
          {subtitle && (
            <p style={{ color: "#888", margin: "0 0 16px", fontSize: 14 }}>{subtitle}</p>
          )}
          {left}
        </div>
        <div>{right}</div>
      </div>
    </div>
  );
}

// ─── Selected Materials Preview ─────────────────────────────────────────────

export interface SelectedMaterialItem {
  id: string;
  icon: string;
  label: string;
  imageUrl?: string;
  text?: string;
}

export function SelectedMaterialsPreview({
  materials,
  emptyMessage = "Select materials",
  onClear,
}: {
  materials: SelectedMaterialItem[];
  emptyMessage?: string;
  onClear: () => void;
}) {
  if (materials.length === 0) {
    return (
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
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={labelStyle}>Materials ({materials.length})</span>
        <button
          type="button"
          onClick={onClear}
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
      {materials.map((mat) => (
        <div key={mat.id} style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
            {mat.icon} {mat.label}
          </div>
          {mat.imageUrl && (
            <img
              src={mat.imageUrl}
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
          {mat.text && (
            <pre style={{ ...codeStyle, margin: 0, maxHeight: 80, fontSize: 12 }}>{mat.text}</pre>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Language Select ────────────────────────────────────────────────────────

export function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
  );
}

// ─── Transmute Button ───────────────────────────────────────────────────────

export function TransmuteButton({
  onClick,
  disabled,
  isLoading,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#ccc" : "#333",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {isLoading ? "Transmuting..." : (label ?? "Transmute")}
    </button>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────────

export function ResultPanel({
  result,
  isLoading,
  error,
  resultMode = "text",
}: {
  result: unknown | null;
  isLoading: boolean;
  error: string | null;
  resultMode?: "text" | "html";
}) {
  if (isLoading) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", color: "#888", fontSize: 13 }}>
        Transmuting...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ ...labelStyle, marginBottom: 6 }}>Error</div>
        <div
          style={{
            ...codeStyle,
            background: "#fff5f5",
            color: "#c62828",
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (result == null) {
    return (
      <div
        style={{
          padding: "24px 0",
          textAlign: "center",
          color: "#ccc",
          fontSize: 12,
        }}
      >
        Results will appear here
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 6 }}>Result</div>
      {typeof result === "string" ? (
        resultMode === "html" ? (
          <>
            <div
              style={{
                ...codeStyle,
                whiteSpace: "normal",
                maxHeight: 400,
                overflow: "auto",
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
          <div
            style={{
              ...codeStyle,
              whiteSpace: "pre-wrap",
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {result}
          </div>
        )
      ) : (
        <pre
          style={{
            ...codeStyle,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
