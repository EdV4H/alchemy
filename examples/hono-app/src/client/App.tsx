import { useCallback, useState } from "react";
import { recipeEntries } from "../shared/recipes.js";

// ─── Sample Materials ───────────────────────────────────────────────────────

interface MaterialCard {
  id: string;
  icon: string;
  label: string;
  text: string;
  imageUrl?: string;
}

const allMaterials: MaterialCard[] = [
  {
    id: "tech-article",
    icon: "\uD83D\uDCDC",
    label: "Tech Article",
    text: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It was developed by Microsoft and first released in 2012. TypeScript adds optional static typing and class-based object-oriented programming to the language. Today it is one of the most popular languages for web development.",
  },
  {
    id: "product-review",
    icon: "\u2B50",
    label: "Product Review",
    text: "I absolutely love this new mechanical keyboard! The tactile feedback is incredibly satisfying, and the build quality feels premium. The RGB lighting is a nice bonus. However, the software for customization could be more intuitive. Overall, I'm very happy with my purchase and would recommend it to anyone who types a lot.",
  },
  {
    id: "japanese-text",
    icon: "\uD83C\uDDEF\uD83C\uDDF5",
    label: "\u65E5\u672C\u8A9E\u30C6\u30AD\u30B9\u30C8",
    text: "\u6771\u4EAC\u306F\u65E5\u672C\u306E\u9996\u90FD\u3067\u3042\u308A\u3001\u4E16\u754C\u6700\u5927\u7D1A\u306E\u90FD\u5E02\u570F\u3092\u6301\u3064\u30E1\u30AC\u30B7\u30C6\u30A3\u3067\u3059\u3002\u4F1D\u7D71\u7684\u306A\u5BFA\u793E\u4ECF\u95A3\u304B\u3089\u8D85\u9AD8\u5C64\u30D3\u30EB\u307E\u3067\u3001\u53E4\u3044\u3082\u306E\u3068\u65B0\u3057\u3044\u3082\u306E\u304C\u5171\u5B58\u3059\u308B\u72EC\u7279\u306E\u6587\u5316\u3092\u6301\u3063\u3066\u3044\u307E\u3059\u3002",
  },
  {
    id: "news-snippet",
    icon: "\uD83D\uDCF0",
    label: "News Snippet",
    text: 'Elon Musk announced that SpaceX successfully launched its Starship rocket from Boca Chica, Texas on March 14, 2025. NASA Administrator Bill Nelson praised the achievement, calling it "a giant leap for commercial spaceflight." The European Space Agency is now in talks with SpaceX for future collaboration on lunar missions.',
  },
  {
    id: "casual-email",
    icon: "\u2709\uFE0F",
    label: "Casual Email",
    text: "hey!! just wanted to let u know that the meeting tmrw is moved to 3pm instead of 2. also can u bring ur laptop bc we need to go over the budget spreadsheet. sry for the late notice lol. oh and dont forget to grab coffee on the way, the office machine is broken again smh.",
  },
  {
    id: "landscape-image",
    icon: "\uD83C\uDFDE\uFE0F",
    label: "Landscape Photo",
    text: "Describe the scene, mood, and notable elements in this image.",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
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

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeEntries[0].recipe.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedEntry = recipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  const selectedMaterials = allMaterials.filter((m) => selectedIds.has(m.id));

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

  const handleTransmute = useCallback(async () => {
    if (!selectedEntry || selectedMaterials.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const imageUrl = selectedMaterials.find((m) => m.imageUrl)?.imageUrl;
      const body: { materials: string[]; imageUrl?: string } = {
        materials: selectedMaterials.map((m) => m.text),
      };
      if (imageUrl) body.imageUrl = imageUrl;
      const res = await fetch(`/api/transmute/${selectedEntry.recipe.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
            <p style={{ color: "#666", margin: "4px 0 16px" }}>{selectedEntry.description}</p>
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
              {selectedMaterials.map((mat) => (
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
                  <pre style={{ ...codeStyle, margin: 0, maxHeight: 80, fontSize: 12 }}>
                    {mat.text}
                  </pre>
                </div>
              ))}
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
