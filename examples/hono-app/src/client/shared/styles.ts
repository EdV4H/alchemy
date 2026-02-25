import type React from "react";

export const codeStyle: React.CSSProperties = {
  background: "#f5f5f5",
  padding: 12,
  borderRadius: 4,
  overflow: "auto",
  fontSize: 13,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: "8px 0",
};

export const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export const popoverSectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  fontSize: 13,
  border: "1px solid #ddd",
  borderRadius: 4,
  boxSizing: "border-box",
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#fff",
};

export const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#888",
  marginBottom: 2,
};

export const primaryButtonStyle: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: 12,
  cursor: "pointer",
  background: "#333",
  color: "#fff",
  border: "none",
  borderRadius: 4,
};

export const secondaryButtonStyle: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: 12,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 4,
};

export const deleteButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#999",
  cursor: "pointer",
  fontSize: 14,
  padding: "0 2px",
  lineHeight: 1,
};

export const cardStyle: React.CSSProperties = {
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  padding: 12,
  marginTop: 8,
};

export const fieldWrapperStyle: React.CSSProperties = {
  marginBottom: 8,
};
