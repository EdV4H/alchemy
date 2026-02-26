import { useState } from "react";
import { inputStyle } from "./styles.js";
import type { TransmuterProvider } from "./useApiKeyStore.js";
import { useApiKeyStore } from "./useApiKeyStore.js";

const providerConfig: Record<
  TransmuterProvider,
  { label: string; placeholder: string; color: string; bgColor: string; borderColor: string }
> = {
  openai: {
    label: "OpenAI",
    placeholder: "sk-...",
    color: "#2e7d32",
    bgColor: "#e8f5e9",
    borderColor: "#4caf50",
  },
  anthropic: {
    label: "Anthropic",
    placeholder: "sk-ant-...",
    color: "#e65100",
    bgColor: "#fff3e0",
    borderColor: "#ff9800",
  },
  google: {
    label: "Google",
    placeholder: "AI...",
    color: "#1565c0",
    bgColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
};

export function ApiKeyInput() {
  const { provider, setProvider, apiKey, setApiKey, clearApiKey } = useApiKeyStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(apiKey);

  const hasKey = apiKey.length > 0;
  const config = providerConfig[provider];
  const masked = hasKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, position: "relative" }}>
      {/* Provider selector */}
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as TransmuterProvider)}
        style={{
          padding: "4px 6px",
          fontSize: 12,
          borderRadius: 4,
          border: `1px solid ${config.borderColor}`,
          background: config.bgColor,
          color: config.color,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="google">Google</option>
      </select>

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
          border: hasKey ? `1px solid ${config.borderColor}` : "1px solid #ff9800",
          background: hasKey ? config.bgColor : "#fff3e0",
          color: hasKey ? config.color : "#e65100",
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
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{config.label} API Key</div>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={config.placeholder}
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
