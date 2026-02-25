import type React from "react";
import { useCallback } from "react";
import { labelStyle } from "../shared/styles.js";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = `${value.slice(0, start)}  ${value.slice(end)}`;
        onChange(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = start + 2;
          target.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange],
  );

  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 6 }}>Prompt Template</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder={"Summarize in 3 bullet points:\n\n{{text}}"}
        style={{
          width: "100%",
          minHeight: 200,
          padding: 12,
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          lineHeight: 1.5,
          border: "1px solid #ddd",
          borderRadius: 6,
          background: "#fafafa",
          color: "#333",
          resize: "vertical",
          boxSizing: "border-box",
          outline: "none",
          tabSize: 2,
        }}
      />
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: "#999",
          lineHeight: 1.6,
        }}
      >
        <span style={{ fontWeight: 600 }}>Available variables:</span>{" "}
        <code style={{ fontSize: 11 }}>{"{{text}}"}</code>{" "}
        <code style={{ fontSize: 11 }}>{"{{allText}}"}</code>{" "}
        <code style={{ fontSize: 11 }}>{"{{textOnly}}"}</code>
      </div>
    </div>
  );
}
