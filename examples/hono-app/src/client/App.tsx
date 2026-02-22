import { useCallback, useMemo, useState } from "react";
import { recipeEntries } from "../shared/recipes.js";

const SAMPLE_MATERIAL = "Hello, world!";

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

export function App() {
  const [text, setText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = recipeEntries[selectedIndex];
  const { recipe } = selected;

  const previewPrompt = useMemo(() => {
    const material = text.trim() || SAMPLE_MATERIAL;
    const result = recipe.spell(material);
    return typeof result === "string" ? result : "(async spell)";
  }, [recipe, text]);

  const handleTransmute = useCallback(async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/transmute/${recipe.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material: text }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [text, recipe]);

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Alchemy Demo</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {recipeEntries.map((entry, i) => (
          <button
            type="button"
            key={entry.recipe.id}
            onClick={() => {
              setSelectedIndex(i);
              setResult(null);
              setError(null);
            }}
            style={{
              padding: "6px 14px",
              fontSize: 14,
              borderRadius: 20,
              border: i === selectedIndex ? "2px solid #333" : "1px solid #ccc",
              background: i === selectedIndex ? "#333" : "#fff",
              color: i === selectedIndex ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <p style={{ color: "#666", margin: "4px 0 8px" }}>{selected.description}</p>

      <button
        type="button"
        onClick={() => setShowPreview((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "#0066cc",
          cursor: "pointer",
          padding: 0,
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        {showPreview ? "Hide" : "Show"} Recipe Preview
      </button>

      {showPreview && (
        <div
          style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 16, marginBottom: 16 }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={labelStyle}>Recipe ID</span>
            <div style={{ fontFamily: "monospace", marginTop: 2 }}>{recipe.id}</div>
          </div>

          {recipe.catalyst?.roleDefinition && (
            <div style={{ marginBottom: 12 }}>
              <span style={labelStyle}>System Prompt (catalyst.roleDefinition)</span>
              <pre style={codeStyle}>{recipe.catalyst.roleDefinition}</pre>
            </div>
          )}

          {recipe.catalyst?.temperature != null && (
            <div style={{ marginBottom: 12 }}>
              <span style={labelStyle}>Temperature</span>
              <div style={{ fontFamily: "monospace", marginTop: 2 }}>
                {recipe.catalyst.temperature}
              </div>
            </div>
          )}

          <div>
            <span style={labelStyle}>Prompt Preview (spell)</span>
            <pre style={codeStyle}>{previewPrompt}</pre>
            {!text.trim() && (
              <div style={{ fontSize: 12, color: "#aaa" }}>
                * Sample input "{SAMPLE_MATERIAL}" used. Type text above to see the actual prompt.
              </div>
            )}
          </div>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type some text here..."
        rows={6}
        style={{ width: "100%", padding: 8, fontSize: 14, boxSizing: "border-box" }}
      />

      <button
        type="button"
        onClick={handleTransmute}
        disabled={isLoading || !text.trim()}
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
  );
}
