import { useState } from "react";
import { handleDeleteWithFallback, RecipeSelector } from "../shared/components.js";
import {
  fieldLabelStyle,
  fieldWrapperStyle,
  inputStyle,
  primaryButtonStyle,
  textareaStyle,
} from "../shared/styles.js";
import type { PlaygroundCatalyst } from "./usePlaygroundStore.js";

interface CatalystEditorProps {
  catalysts: PlaygroundCatalyst[];
  onAdd: (catalyst: Omit<PlaygroundCatalyst, "id">) => string;
  onUpdate: (id: string, updates: Partial<Omit<PlaygroundCatalyst, "id">>) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CatalystEditor({
  catalysts,
  onAdd,
  onUpdate,
  onDelete,
  selectedId,
  onSelect,
}: CatalystEditorProps) {
  const [editing, setEditing] = useState(false);
  const selected = catalysts.find((c) => c.id === selectedId);

  return (
    <div>
      <RecipeSelector
        items={catalysts.map((c) => ({ id: c.id, label: c.name }))}
        selectedId={selectedId}
        onSelect={(id) => {
          onSelect(id);
          setEditing(false);
        }}
        onDelete={(id) => handleDeleteWithFallback(catalysts, id, selectedId, onDelete, onSelect)}
        onAdd={() => {
          const id = onAdd({
            name: "New Catalyst",
            roleDefinition: "You are a helpful assistant.",
            temperature: 0.4,
          });
          onSelect(id);
          setEditing(true);
        }}
        minItems={1}
      />

      {/* Edit selected catalyst */}
      {selected && editing && (
        <div
          style={{
            marginTop: 8,
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            padding: 10,
          }}
        >
          <div style={fieldWrapperStyle}>
            <div style={fieldLabelStyle}>Name</div>
            <input
              value={selected.name}
              onChange={(e) => onUpdate(selected.id, { name: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={fieldWrapperStyle}>
            <div style={fieldLabelStyle}>Role Definition</div>
            <textarea
              value={selected.roleDefinition}
              onChange={(e) => onUpdate(selected.id, { roleDefinition: e.target.value })}
              rows={3}
              style={textareaStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={fieldLabelStyle}>Temperature</div>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={selected.temperature}
                onChange={(e) => onUpdate(selected.id, { temperature: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={fieldLabelStyle}>Model (optional)</div>
              <input
                value={selected.model ?? ""}
                onChange={(e) => onUpdate(selected.id, { model: e.target.value || undefined })}
                placeholder="e.g. gpt-4o"
                style={inputStyle}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{ ...primaryButtonStyle, marginTop: 8 }}
          >
            Done
          </button>
        </div>
      )}

      {selected && !editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            marginTop: 4,
            padding: "2px 8px",
            fontSize: 10,
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "#999",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: 2,
          }}
        >
          edit
        </button>
      )}
    </div>
  );
}
