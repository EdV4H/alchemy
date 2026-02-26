import { useCallback, useState } from "react";

export interface PromptPreviewData {
  system?: string;
  user: string;
}

interface CopyPromptButtonProps {
  onFetchPreview: () => Promise<PromptPreviewData>;
  disabled?: boolean;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        padding: "4px 12px",
        fontSize: 12,
        cursor: "pointer",
        background: copied ? "#4caf50" : "#333",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        transition: "background 0.2s",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export function CopyPromptButton({ onFetchPreview, disabled }: CopyPromptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PromptPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await onFetchPreview();
      setPreview(data);
      setIsOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onFetchPreview]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPreview(null);
    setError(null);
  }, []);

  const allText = preview
    ? [preview.system ? `[System]\n${preview.system}` : "", `[User]\n${preview.user}`]
        .filter(Boolean)
        .join("\n\n")
    : "";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        style={{
          width: "100%",
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: disabled || isLoading ? "not-allowed" : "pointer",
          background: "#fff",
          color: disabled || isLoading ? "#999" : "#333",
          border: "1px solid",
          borderColor: disabled || isLoading ? "#ccc" : "#333",
          borderRadius: 6,
          opacity: disabled || isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? "Loading..." : "Copy Prompt"}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              maxWidth: 720,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16 }}>Prompt Preview</h3>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#999",
                  padding: "0 4px",
                }}
              >
                &times;
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  color: "#c62828",
                  border: "1px solid #ffcdd2",
                  borderRadius: 4,
                  padding: 12,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            {preview && (
              <>
                {preview.system && (
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#999",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        System Prompt
                      </span>
                      <CopyButton text={preview.system} label="Copy System" />
                    </div>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        margin: 0,
                        maxHeight: 200,
                        overflow: "auto",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {preview.system}
                    </pre>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      User Prompt
                    </span>
                    <CopyButton text={preview.user} label="Copy User" />
                  </div>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      borderRadius: 4,
                      padding: 12,
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      maxHeight: 300,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {preview.user}
                  </pre>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <CopyButton text={allText} label="Copy All" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
