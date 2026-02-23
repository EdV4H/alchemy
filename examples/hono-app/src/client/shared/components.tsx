import { useEffect, useRef, useState } from "react";
import type { RecipeEntry, RecipeFieldMeta } from "../../shared/recipes.js";
import { popoverSectionLabel } from "./styles.js";
import type { CustomMaterial } from "./types.js";

// ─── Custom Material Forms ──────────────────────────────────────────────────

export function CustomTextForm({
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

export function CustomImageForm({
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

export function CustomDataForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [format, setFormat] = useState<"csv" | "json" | "tsv">("csv");
  const [content, setContent] = useState("");

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 12, marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="My data"
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
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Format</div>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "csv" | "json" | "tsv")}
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="tsv">TSV</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Content</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Paste your data..."
          style={{
            width: "100%",
            padding: "4px 6px",
            fontSize: 13,
            fontFamily: "monospace",
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
            if (!content.trim()) return;
            onAdd({
              id: `custom-data-${Date.now()}`,
              label: label.trim() || "Custom Data",
              type: "data",
              dataFormat: format,
              dataContent: content.trim(),
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

export function CustomDocumentForm({
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
          placeholder="My document"
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
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Document text</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste your document text..."
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
              id: `custom-doc-${Date.now()}`,
              label: label.trim() || "Custom Document",
              type: "document",
              documentText: text.trim(),
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

export function CustomAudioForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 12, marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="My audio"
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
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Audio URL</div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://...mp3"
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
              id: `custom-audio-${Date.now()}`,
              label: label.trim() || "Custom Audio",
              type: "audio",
              audioUrl: url.trim(),
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

export function CustomVideoForm({
  onAdd,
  onCancel,
}: {
  onAdd: (m: CustomMaterial) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: 12, marginTop: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Label</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="My video"
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
        <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Video URL</div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://...mp4"
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
              id: `custom-video-${Date.now()}`,
              label: label.trim() || "Custom Video",
              type: "video",
              videoUrl: url.trim(),
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

export function RecipeInfoPopover({ entry, onClose }: { entry: RecipeEntry; onClose: () => void }) {
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
