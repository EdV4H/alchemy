import { useEffect, useRef, useState } from "react";
import { codeStyle } from "./styles.js";

export function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "strict",
        });
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div>
        <div
          style={{
            ...codeStyle,
            background: "#fff5f5",
            color: "#c62828",
            border: "1px solid #ffcdd2",
            marginBottom: 8,
          }}
        >
          Mermaid render error: {error}
        </div>
        <pre style={{ ...codeStyle, fontSize: 12 }}>{code}</pre>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          background: "#fff",
          borderRadius: 6,
          border: "1px solid #e0e0e0",
          padding: 16,
          overflow: "auto",
          maxHeight: 500,
        }}
      />
      <details>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "#888", marginTop: 8 }}>
          View Mermaid Source
        </summary>
        <pre style={{ ...codeStyle, marginTop: 8, fontSize: 12 }}>{code}</pre>
      </details>
    </div>
  );
}
