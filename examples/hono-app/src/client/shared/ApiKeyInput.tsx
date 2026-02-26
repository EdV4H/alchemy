import { useState } from "react";
import { inputStyle } from "./styles.js";
import { useApiKeyStore } from "./useApiKeyStore.js";

export function ApiKeyInput() {
  const { apiKey, setApiKey, clearApiKey } = useApiKeyStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(apiKey);

  const hasKey = apiKey.length > 0;
  const masked = hasKey ? `sk-...${apiKey.slice(-4)}` : "";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setDraft(apiKey);
          setOpen(!open);
        }}
        style={{
          padding: "4px 10px",
          fontSize: 12,
          borderRadius: 4,
          border: hasKey ? "1px solid #4caf50" : "1px solid #ff9800",
          background: hasKey ? "#e8f5e9" : "#fff3e0",
          color: hasKey ? "#2e7d32" : "#e65100",
          cursor: "pointer",
        }}
      >
        {hasKey ? `API Key: ${masked}` : "Set API Key"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            padding: 12,
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 100,
            minWidth: 280,
          }}
        >
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>OpenAI API Key</div>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-..."
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                setApiKey(draft.trim());
                setOpen(false);
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
              Save
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={() => {
                  clearApiKey();
                  setDraft("");
                  setOpen(false);
                }}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  color: "#c62828",
                }}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
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
      )}
    </div>
  );
}
