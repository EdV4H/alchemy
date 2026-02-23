import { useCallback, useEffect, useRef, useState } from "react";
import type { RecipeEntry, RecipeFieldMeta } from "../shared/recipes.js";
import { recipeEntries } from "../shared/recipes.js";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MaterialInput {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

interface MaterialCard {
  id: string;
  icon: string;
  label: string;
  category: "text" | "code" | "image";
  text: string;
  imageUrl?: string;
}

interface CustomMaterial {
  id: string;
  label: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

// ─── Sample Materials ───────────────────────────────────────────────────────

const allMaterials: MaterialCard[] = [
  {
    id: "tech-article",
    icon: "\uD83D\uDCDC",
    label: "Tech Article",
    category: "text",
    text: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It was developed by Microsoft and first released in 2012. TypeScript adds optional static typing and class-based object-oriented programming to the language. Today it is one of the most popular languages for web development.",
  },
  {
    id: "product-review",
    icon: "\u2B50",
    label: "Product Review",
    category: "text",
    text: "I absolutely love this new mechanical keyboard! The tactile feedback is incredibly satisfying, and the build quality feels premium. The RGB lighting is a nice bonus. However, the software for customization could be more intuitive. Overall, I'm very happy with my purchase and would recommend it to anyone who types a lot.",
  },
  {
    id: "japanese-text",
    icon: "\uD83C\uDDEF\uD83C\uDDF5",
    label: "\u65E5\u672C\u8A9E\u30C6\u30AD\u30B9\u30C8",
    category: "text",
    text: "\u6771\u4EAC\u306F\u65E5\u672C\u306E\u9996\u90FD\u3067\u3042\u308A\u3001\u4E16\u754C\u6700\u5927\u7D1A\u306E\u90FD\u5E02\u570F\u3092\u6301\u3064\u30E1\u30AC\u30B7\u30C6\u30A3\u3067\u3059\u3002\u4F1D\u7D71\u7684\u306A\u5BFA\u793E\u4ECF\u95A3\u304B\u3089\u8D85\u9AD8\u5C64\u30D3\u30EB\u307E\u3067\u3001\u53E4\u3044\u3082\u306E\u3068\u65B0\u3057\u3044\u3082\u306E\u304C\u5171\u5B58\u3059\u308B\u72EC\u7279\u306E\u6587\u5316\u3092\u6301\u3063\u3066\u3044\u307E\u3059\u3002",
  },
  {
    id: "news-snippet",
    icon: "\uD83D\uDCF0",
    label: "News Snippet",
    category: "text",
    text: 'Elon Musk announced that SpaceX successfully launched its Starship rocket from Boca Chica, Texas on March 14, 2025. NASA Administrator Bill Nelson praised the achievement, calling it "a giant leap for commercial spaceflight." The European Space Agency is now in talks with SpaceX for future collaboration on lunar missions.',
  },
  {
    id: "casual-email",
    icon: "\u2709\uFE0F",
    label: "Casual Email",
    category: "text",
    text: "hey!! just wanted to let u know that the meeting tmrw is moved to 3pm instead of 2. also can u bring ur laptop bc we need to go over the budget spreadsheet. sry for the late notice lol. oh and dont forget to grab coffee on the way, the office machine is broken again smh.",
  },
  {
    id: "academic-abstract",
    icon: "\uD83C\uDF93",
    label: "Academic Abstract",
    category: "text",
    text: "This paper investigates the emergent capabilities of large language models (LLMs) when subjected to chain-of-thought prompting. We demonstrate that models with over 100 billion parameters exhibit a qualitative shift in reasoning ability, particularly in mathematical and logical tasks. Our experiments across five benchmark datasets show an average improvement of 23% in accuracy. We discuss implications for AI alignment and propose a framework for evaluating reasoning depth in future models.",
  },
  {
    id: "code-typescript",
    icon: "\uD83D\uDCBB",
    label: "TypeScript Code",
    category: "code",
    text: 'interface User {\n  id: string;\n  name: string;\n  email: string;\n  role: "admin" | "user" | "guest";\n}\n\nasync function fetchUsers(filter?: Partial<User>): Promise<User[]> {\n  const params = new URLSearchParams();\n  if (filter) {\n    for (const [key, value] of Object.entries(filter)) {\n      if (value) params.set(key, String(value));\n    }\n  }\n  const res = await fetch("/api/users?" + params);\n  if (!res.ok) throw new Error("Failed: " + res.status);\n  return res.json();\n}',
  },
  {
    id: "code-python",
    icon: "\uD83D\uDC0D",
    label: "Python Code",
    category: "code",
    text: 'from dataclasses import dataclass\nfrom typing import Optional\nimport asyncio\n\n@dataclass\nclass Task:\n    id: int\n    title: str\n    completed: bool = False\n    assignee: Optional[str] = None\n\nasync def process_tasks(tasks: list[Task]) -> dict[str, int]:\n    results = {"completed": 0, "pending": 0}\n    for task in tasks:\n        await asyncio.sleep(0.1)  # simulate work\n        if task.completed:\n            results["completed"] += 1\n        else:\n            results["pending"] += 1\n    return results',
  },
  {
    id: "json-data",
    icon: "\uD83D\uDCC8",
    label: "JSON Data",
    category: "code",
    text: '{\n  "company": "Acme Corp",\n  "founded": 2019,\n  "employees": 142,\n  "revenue": { "2023": 12500000, "2024": 18700000 },\n  "departments": [\n    { "name": "Engineering", "headcount": 58, "budget": 4200000 },\n    { "name": "Sales", "headcount": 34, "budget": 2800000 },\n    { "name": "Marketing", "headcount": 22, "budget": 1500000 }\n  ],\n  "publiclyTraded": false\n}',
  },
  {
    id: "landscape-image",
    icon: "\uD83C\uDFDE\uFE0F",
    label: "Landscape Photo",
    category: "image",
    text: "Describe the scene, mood, and notable elements in this image.",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
  },
  {
    id: "architecture-image",
    icon: "\uD83C\uDFD9\uFE0F",
    label: "Architecture Photo",
    category: "image",
    text: "Describe the architectural style, materials, and design elements in this image.",
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
  },
  {
    id: "food-image",
    icon: "\uD83C\uDF5C",
    label: "Food Photo",
    category: "image",
    text: "Describe the dish, ingredients, and presentation in this image.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  },
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const codeStyle: React.CSSProperties = {
  background: "#f5f5f5",
  padding: 12,
  borderRadius: 4,
  overflow: "auto",
  fontSize: 13,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: "8px 0",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

// ─── Custom Material Form ───────────────────────────────────────────────────

function CustomTextForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 12, marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="My text"
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Text</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Enter your text..."
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => {
            if (!text.trim()) return;
            onAdd({
              id: `custom-text-${Date.now()}`,
              label: label.trim() || "Custom Text",
              type: "text",
              text: text.trim(),
            });
          }}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CustomImageForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 12, marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="My image"
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Prompt</div>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what to analyze..."
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Image URL</div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => {
            if (!url.trim()) return;
            onAdd({
              id: `custom-image-${Date.now()}`,
              label: label.trim() || "Custom Image",
              type: "image",
              text: prompt.trim() || undefined,
              imageUrl: url.trim(),
            });
          }}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Recipe Info Popover ────────────────────────────────────────────────────

const popoverSectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};

function FieldRow({ field, depth = 0 }: { field: RecipeFieldMeta; depth?: number }) {
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

function RecipeInfoPopover({ entry, onClose }: { entry: RecipeEntry; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { meta } = entry;
  const catalyst = entry.recipe.catalyst;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: 6,
        width: 360,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 6,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: 14,
        zIndex: 100,
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

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeEntries[0].recipe.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [showForm, setShowForm] = useState<"text" | "image" | null>(null);
  const [infoPopoverId, setInfoPopoverId] = useState<string | null>(null);

  const selectedEntry = recipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  // Combine preset materials with custom ones for selection lookup
  const allSelectableMaterials: (MaterialCard | (CustomMaterial & { icon: string }))[] = [
    ...allMaterials,
    ...customMaterials.map((c) => ({
      ...c,
      icon: c.type === "text" ? "\uD83D\uDCDD" : "\uD83D\uDDBC\uFE0F",
    })),
  ];

  const selectedMaterials = allSelectableMaterials.filter((m) => selectedIds.has(m.id));

  const toggleMaterial = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setResult(null);
    setError(null);
  };

  const addCustomMaterial = (m: CustomMaterial) => {
    setCustomMaterials((prev) => [...prev, m]);
    setShowForm(null);
  };

  const removeCustomMaterial = (id: string) => {
    setCustomMaterials((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleTransmute = useCallback(async () => {
    if (!selectedEntry || selectedMaterials.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const materialInputs: MaterialInput[] = selectedMaterials.flatMap((m) => {
        const inputs: MaterialInput[] = [];
        if ("text" in m && m.text) inputs.push({ type: "text", text: m.text });
        if ("imageUrl" in m && m.imageUrl) inputs.push({ type: "image", imageUrl: m.imageUrl });
        return inputs;
      });
      const res = await fetch(`/api/transmute/${selectedEntry.recipe.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials: materialInputs }),
      });
      if (!res.ok) {
        const b = await res.text();
        throw new Error(`${res.status}: ${b}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntry, selectedMaterials]);

  const hasSelection = selectedMaterials.length > 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 260px",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* ── Left: Recipe + Transmute ── */}
        <div>
          <h1>Alchemy Demo</h1>

          {/* Recipe selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
            {recipeEntries.map((entry) => {
              const active = entry.recipe.id === selectedRecipeId;
              return (
                <button
                  type="button"
                  key={entry.recipe.id}
                  onClick={() => {
                    setSelectedRecipeId(entry.recipe.id);
                    setInfoPopoverId(null);
                    setResult(null);
                    setError(null);
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
                    setSelectedIds(new Set());
                    setResult(null);
                    setError(null);
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
              Select materials from the shelf &rarr;
            </div>
          )}

          {/* Transmute Button */}
          <button
            type="button"
            onClick={handleTransmute}
            disabled={isLoading || !hasSelection}
            style={{ marginTop: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
          >
            {isLoading ? "Transmuting..." : "Transmute"}
          </button>

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

          {result != null && (
            <div style={{ marginTop: 24 }}>
              <h2>Result</h2>
              {typeof result === "string" ? (
                <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
              ) : (
                <pre style={codeStyle}>{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Material Shelf ── */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {allMaterials.map((mat) => {
              const active = selectedIds.has(mat.id);
              return (
                <button
                  type="button"
                  key={mat.id}
                  onClick={() => toggleMaterial(mat.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    background: active ? "#f0f0f0" : "#fff",
                    border: active ? "2px solid #333" : "1px solid #e0e0e0",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#333",
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{mat.icon}</span>
                  <span style={{ fontWeight: 500 }}>{mat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom materials */}
          {customMaterials.length > 0 && (
            <>
              <div style={{ ...labelStyle, marginTop: 16, marginBottom: 8 }}>Custom</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {customMaterials.map((mat) => {
                  const active = selectedIds.has(mat.id);
                  return (
                    <div key={mat.id} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleMaterial(mat.id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          background: active ? "#f0f0f0" : "#fff",
                          border: active ? "2px solid #333" : "1px solid #e0e0e0",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#333",
                          textAlign: "left",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0 }}>
                          {mat.type === "text" ? "\uD83D\uDCDD" : "\uD83D\uDDBC\uFE0F"}
                        </span>
                        <span style={{ fontWeight: 500 }}>{mat.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomMaterial(mat.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: "0 4px",
                          lineHeight: 1,
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
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => setShowForm(showForm === "text" ? null : "text")}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  color: "#555",
                }}
              >
                + Add Text
              </button>
              <button
                type="button"
                onClick={() => setShowForm(showForm === "image" ? null : "image")}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  color: "#555",
                }}
              >
                + Add Image URL
              </button>
            </div>
            {showForm === "text" && (
              <CustomTextForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "image" && (
              <CustomImageForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
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
