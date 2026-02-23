import { useCallback, useEffect, useRef, useState } from "react";
import { catalystPresets } from "../shared/catalysts.js";
import type { RecipeEntry, RecipeFieldMeta } from "../shared/recipes.js";
import { recipeEntries } from "../shared/recipes.js";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MaterialInput {
  type: "text" | "image" | "audio" | "document" | "video" | "data";
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  documentText?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  dataLabel?: string;
}

interface MaterialCard {
  id: string;
  icon: string;
  label: string;
  category: "text" | "code" | "image" | "audio" | "video" | "data" | "document";
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  documentText?: string;
}

interface CustomMaterial {
  id: string;
  label: string;
  type: "text" | "image" | "audio" | "video" | "data" | "document";
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  documentText?: string;
}

// ─── Sample Materials ───────────────────────────────────────────────────────

const allMaterials: MaterialCard[] = [
  {
    id: "tech-article",
    icon: "\uD83D\uDCDC",
    label: "Tech Article",
    category: "text",
    text: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It was developed by Microsoft and first released in 2012. TypeScript adds optional static typing and class-based object-oriented programming to the language. Today it is one of the most popular languages for web development.",
  },
  {
    id: "product-review",
    icon: "\u2B50",
    label: "Product Review",
    category: "text",
    text: "I absolutely love this new mechanical keyboard! The tactile feedback is incredibly satisfying, and the build quality feels premium. The RGB lighting is a nice bonus. However, the software for customization could be more intuitive. Overall, I'm very happy with my purchase and would recommend it to anyone who types a lot.",
  },
  {
    id: "japanese-text",
    icon: "\uD83C\uDDEF\uD83C\uDDF5",
    label: "\u65E5\u672C\u8A9E\u30C6\u30AD\u30B9\u30C8",
    category: "text",
    text: "\u6771\u4EAC\u306F\u65E5\u672C\u306E\u9996\u90FD\u3067\u3042\u308A\u3001\u4E16\u754C\u6700\u5927\u7D1A\u306E\u90FD\u5E02\u570F\u3092\u6301\u3064\u30E1\u30AC\u30B7\u30C6\u30A3\u3067\u3059\u3002\u4F1D\u7D71\u7684\u306A\u5BFA\u793E\u4ECF\u95A3\u304B\u3089\u8D85\u9AD8\u5C64\u30D3\u30EB\u307E\u3067\u3001\u53E4\u3044\u3082\u306E\u3068\u65B0\u3057\u3044\u3082\u306E\u304C\u5171\u5B58\u3059\u308B\u72EC\u7279\u306E\u6587\u5316\u3092\u6301\u3063\u3066\u3044\u307E\u3059\u3002",
  },
  {
    id: "news-snippet",
    icon: "\uD83D\uDCF0",
    label: "News Snippet",
    category: "text",
    text: 'Elon Musk announced that SpaceX successfully launched its Starship rocket from Boca Chica, Texas on March 14, 2025. NASA Administrator Bill Nelson praised the achievement, calling it "a giant leap for commercial spaceflight." The European Space Agency is now in talks with SpaceX for future collaboration on lunar missions.',
  },
  {
    id: "casual-email",
    icon: "\u2709\uFE0F",
    label: "Casual Email",
    category: "text",
    text: "hey!! just wanted to let u know that the meeting tmrw is moved to 3pm instead of 2. also can u bring ur laptop bc we need to go over the budget spreadsheet. sry for the late notice lol. oh and dont forget to grab coffee on the way, the office machine is broken again smh.",
  },
  {
    id: "academic-abstract",
    icon: "\uD83C\uDF93",
    label: "Academic Abstract",
    category: "text",
    text: "This paper investigates the emergent capabilities of large language models (LLMs) when subjected to chain-of-thought prompting. We demonstrate that models with over 100 billion parameters exhibit a qualitative shift in reasoning ability, particularly in mathematical and logical tasks. Our experiments across five benchmark datasets show an average improvement of 23% in accuracy. We discuss implications for AI alignment and propose a framework for evaluating reasoning depth in future models.",
  },
  {
    id: "code-typescript",
    icon: "\uD83D\uDCBB",
    label: "TypeScript Code",
    category: "code",
    text: 'interface User {\n  id: string;\n  name: string;\n  email: string;\n  role: "admin" | "user" | "guest";\n}\n\nasync function fetchUsers(filter?: Partial<User>): Promise<User[]> {\n  const params = new URLSearchParams();\n  if (filter) {\n    for (const [key, value] of Object.entries(filter)) {\n      if (value) params.set(key, String(value));\n    }\n  }\n  const res = await fetch("/api/users?" + params);\n  if (!res.ok) throw new Error("Failed: " + res.status);\n  return res.json();\n}',
  },
  {
    id: "code-python",
    icon: "\uD83D\uDC0D",
    label: "Python Code",
    category: "code",
    text: 'from dataclasses import dataclass\nfrom typing import Optional\nimport asyncio\n\n@dataclass\nclass Task:\n    id: int\n    title: str\n    completed: bool = False\n    assignee: Optional[str] = None\n\nasync def process_tasks(tasks: list[Task]) -> dict[str, int]:\n    results = {"completed": 0, "pending": 0}\n    for task in tasks:\n        await asyncio.sleep(0.1)  # simulate work\n        if task.completed:\n            results["completed"] += 1\n        else:\n            results["pending"] += 1\n    return results',
  },
  {
    id: "json-data",
    icon: "\uD83D\uDCC8",
    label: "JSON Data",
    category: "code",
    text: '{\n  "company": "Acme Corp",\n  "founded": 2019,\n  "employees": 142,\n  "revenue": { "2023": 12500000, "2024": 18700000 },\n  "departments": [\n    { "name": "Engineering", "headcount": 58, "budget": 4200000 },\n    { "name": "Sales", "headcount": 34, "budget": 2800000 },\n    { "name": "Marketing", "headcount": 22, "budget": 1500000 }\n  ],\n  "publiclyTraded": false\n}',
  },
  {
    id: "landscape-image",
    icon: "\uD83C\uDFDE\uFE0F",
    label: "Landscape Photo",
    category: "image",
    text: "Describe the scene, mood, and notable elements in this image.",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
  },
  {
    id: "architecture-image",
    icon: "\uD83C\uDFD9\uFE0F",
    label: "Architecture Photo",
    category: "image",
    text: "Describe the architectural style, materials, and design elements in this image.",
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
  },
  {
    id: "food-image",
    icon: "\uD83C\uDF5C",
    label: "Food Photo",
    category: "image",
    text: "Describe the dish, ingredients, and presentation in this image.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  },
  {
    id: "sales-csv",
    icon: "\uD83D\uDCCA",
    label: "Sales CSV",
    category: "data",
    text: "Monthly sales data (CSV)",
    dataFormat: "csv",
    dataContent:
      "month,product,units,revenue\nJan,Widget A,120,24000\nJan,Widget B,85,17000\nFeb,Widget A,95,19000\nFeb,Widget B,110,22000\nMar,Widget A,150,30000\nMar,Widget B,70,14000\nApr,Widget A,60,12000\nApr,Widget B,130,26000",
  },
  {
    id: "config-json",
    icon: "\u2699\uFE0F",
    label: "Config JSON",
    category: "data",
    text: "Application configuration (JSON)",
    dataFormat: "json",
    dataContent:
      '{"database":{"host":"db.example.com","port":5432,"pool":{"min":2,"max":10}},"cache":{"ttl":3600,"maxSize":1000},"logging":{"level":"info","format":"json"},"features":{"darkMode":true,"betaAccess":false}}',
  },
  {
    id: "podcast-clip",
    icon: "\uD83C\uDFA7",
    label: "Podcast Clip",
    category: "audio",
    text: "Audio clip (stub: transcription not yet available)",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "demo-video",
    icon: "\uD83C\uDFAC",
    label: "Demo Video",
    category: "video",
    text: "Video clip (stub: frame extraction not yet available)",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "tech-spec",
    icon: "\uD83D\uDCC4",
    label: "Technical Spec",
    category: "document",
    text: "A technical specification document",
    documentText:
      "# Authentication Service Specification\n\n## Overview\nThe authentication service handles user login, registration, and session management using JWT tokens.\n\n## Requirements\n1. Support email/password and OAuth2 (Google, GitHub) login methods\n2. JWT tokens with 15-minute access token and 7-day refresh token\n3. Rate limiting: max 5 failed attempts per IP per 15 minutes\n4. Password requirements: min 8 chars, 1 uppercase, 1 number\n\n## API Endpoints\n- POST /auth/register - Create new account\n- POST /auth/login - Authenticate and receive tokens\n- POST /auth/refresh - Refresh access token\n- POST /auth/logout - Invalidate refresh token\n\n## Security Considerations\n- All passwords hashed with bcrypt (cost factor 12)\n- Refresh tokens stored in httpOnly cookies\n- CSRF protection via double-submit cookie pattern",
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

// ─── Custom Material Form ───────────────────────────────────────────────────

function CustomTextForm({
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

function CustomImageForm({
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

function CustomDataForm({
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

function CustomDocumentForm({
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

function CustomAudioForm({
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

function CustomVideoForm({
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

const popoverSectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};

function FieldRow({ field, depth = 0 }: { field: RecipeFieldMeta; depth?: number }) {
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

function RecipeInfoPopover({ entry, onClose }: { entry: RecipeEntry; onClose: () => void }) {
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

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeEntries[0].recipe.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [showForm, setShowForm] = useState<
    "text" | "image" | "audio" | "video" | "data" | "document" | null
  >(null);
  const [infoPopoverId, setInfoPopoverId] = useState<string | null>(null);
  const [selectedCatalystKey, setSelectedCatalystKey] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareKeys, setSelectedCompareKeys] = useState<string[]>([]);
  const [compareResults, setCompareResults] = useState<Record<string, unknown> | null>(null);

  const selectedEntry = recipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  // Combine preset materials with custom ones for selection lookup
  const allSelectableMaterials: (MaterialCard | (CustomMaterial & { icon: string }))[] = [
    ...allMaterials,
    ...customMaterials.map((c) => ({
      ...c,
      icon:
        c.type === "data"
          ? "\uD83D\uDCCA"
          : c.type === "document"
            ? "\uD83D\uDCC4"
            : c.type === "audio"
              ? "\uD83C\uDFA7"
              : c.type === "video"
                ? "\uD83C\uDFAC"
                : c.type === "image"
                  ? "\uD83D\uDDBC\uFE0F"
                  : "\uD83D\uDCDD",
    })),
  ];

  const selectedMaterials = allSelectableMaterials.filter((m) => selectedIds.has(m.id));

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

  const addCustomMaterial = (m: CustomMaterial) => {
    setCustomMaterials((prev) => [...prev, m]);
    setShowForm(null);
  };

  const removeCustomMaterial = (id: string) => {
    setCustomMaterials((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const buildMaterialInputs = useCallback((): MaterialInput[] => {
    return selectedMaterials.flatMap((m) => {
      const inputs: MaterialInput[] = [];
      const category = "category" in m ? m.category : undefined;
      if (category === "data" || ("type" in m && m.type === "data")) {
        const dc = "dataContent" in m ? m.dataContent : undefined;
        const df = "dataFormat" in m ? m.dataFormat : undefined;
        if (dc && df) {
          inputs.push({ type: "data", dataFormat: df, dataContent: dc, dataLabel: m.label });
        }
      } else if (category === "document" || ("type" in m && m.type === "document")) {
        const dt = "documentText" in m ? m.documentText : undefined;
        if (dt) {
          inputs.push({ type: "document", documentText: dt });
        }
      } else if (category === "audio" || ("type" in m && m.type === "audio")) {
        const au = "audioUrl" in m ? m.audioUrl : undefined;
        if (au) {
          inputs.push({ type: "audio", audioUrl: au });
        }
      } else if (category === "video" || ("type" in m && m.type === "video")) {
        const vu = "videoUrl" in m ? m.videoUrl : undefined;
        if (vu) {
          inputs.push({ type: "video", videoUrl: vu });
        }
      } else {
        if ("text" in m && m.text) inputs.push({ type: "text", text: m.text });
        if ("imageUrl" in m && m.imageUrl) inputs.push({ type: "image", imageUrl: m.imageUrl });
      }
      return inputs;
    });
  }, [selectedMaterials]);

  const handleTransmute = useCallback(async () => {
    if (!selectedEntry || selectedMaterials.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCompareResults(null);
    try {
      const materialInputs = buildMaterialInputs();
      const res = await fetch(`/api/transmute/${selectedEntry.recipe.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials: materialInputs,
          catalystKey: selectedCatalystKey ?? undefined,
        }),
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
  }, [selectedEntry, selectedMaterials, selectedCatalystKey, buildMaterialInputs]);

  const handleCompare = useCallback(async () => {
    if (!selectedEntry || selectedMaterials.length === 0 || selectedCompareKeys.length < 2) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCompareResults(null);
    try {
      const materialInputs = buildMaterialInputs();
      const res = await fetch(`/api/compare/${selectedEntry.recipe.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials: materialInputs,
          catalystKeys: selectedCompareKeys,
        }),
      });
      if (!res.ok) {
        const b = await res.text();
        throw new Error(`${res.status}: ${b}`);
      }
      setCompareResults(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntry, selectedMaterials, selectedCompareKeys, buildMaterialInputs]);

  const hasSelection = selectedMaterials.length > 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 420px",
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
                    setInfoPopoverId(null);
                    setResult(null);
                    setError(null);
                    setSelectedCatalystKey(null);
                    setCompareMode(false);
                    setSelectedCompareKeys([]);
                    setCompareResults(null);
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
            <div style={{ position: "relative", margin: "4px 0 16px" }}>
              <p style={{ color: "#666", margin: 0, display: "inline" }}>
                {selectedEntry.description}
              </p>
              <button
                type="button"
                onClick={() =>
                  setInfoPopoverId(
                    infoPopoverId === selectedEntry.recipe.id ? null : selectedEntry.recipe.id,
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "0 0 0 6px",
                  verticalAlign: "baseline",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 2,
                }}
              >
                details
              </button>
              {infoPopoverId === selectedEntry.recipe.id && (
                <RecipeInfoPopover entry={selectedEntry} onClose={() => setInfoPopoverId(null)} />
              )}
            </div>
          )}

          {/* Catalyst selector (global presets) */}
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...labelStyle, margin: 0 }}>Catalyst</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {/* Default = no override, use recipe's built-in catalyst */}
                <button
                  type="button"
                  onClick={() => {
                    if (!compareMode) {
                      setSelectedCatalystKey(null);
                      setResult(null);
                      setCompareResults(null);
                    }
                  }}
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    borderRadius: 14,
                    border:
                      !compareMode && selectedCatalystKey === null
                        ? "2px solid #333"
                        : "1px solid #ccc",
                    background: !compareMode && selectedCatalystKey === null ? "#333" : "#fff",
                    color: !compareMode && selectedCatalystKey === null ? "#fff" : "#555",
                    cursor: "pointer",
                  }}
                >
                  Default
                </button>
                {catalystPresets.map((cat) => {
                  const isSelected = compareMode
                    ? selectedCompareKeys.includes(cat.key)
                    : selectedCatalystKey === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => {
                        if (compareMode) {
                          setSelectedCompareKeys((prev) =>
                            prev.includes(cat.key)
                              ? prev.filter((k) => k !== cat.key)
                              : [...prev, cat.key],
                          );
                        } else {
                          setSelectedCatalystKey(cat.key);
                          setResult(null);
                          setCompareResults(null);
                        }
                      }}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        borderRadius: 14,
                        border: isSelected ? "2px solid #333" : "1px solid #ccc",
                        background: isSelected ? "#333" : "#fff",
                        color: isSelected ? "#fff" : "#555",
                        cursor: "pointer",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#888",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                <input
                  type="checkbox"
                  checked={compareMode}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setCompareMode(on);
                    setResult(null);
                    setCompareResults(null);
                    if (on) {
                      setSelectedCompareKeys(catalystPresets.map((c) => c.key));
                    } else {
                      setSelectedCompareKeys([]);
                    }
                  }}
                />
                Compare
              </label>
            </div>
          </div>

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
              {selectedMaterials.map((mat) => {
                const imageUrl = "imageUrl" in mat ? mat.imageUrl : undefined;
                const text = "text" in mat ? mat.text : undefined;
                return (
                  <div key={mat.id} style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {mat.icon} {mat.label}
                    </div>
                    {imageUrl && (
                      <img
                        src={imageUrl}
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
                    {text && (
                      <pre style={{ ...codeStyle, margin: 0, maxHeight: 80, fontSize: 12 }}>
                        {text}
                      </pre>
                    )}
                  </div>
                );
              })}
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

          {/* Transmute / Compare Button */}
          {compareMode ? (
            <button
              type="button"
              onClick={handleCompare}
              disabled={isLoading || !hasSelection || selectedCompareKeys.length < 2}
              style={{ marginTop: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
            >
              {isLoading ? "Comparing..." : `Compare (${selectedCompareKeys.length} catalysts)`}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTransmute}
              disabled={isLoading || !hasSelection}
              style={{ marginTop: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
            >
              {isLoading ? "Transmuting..." : "Transmute"}
            </button>
          )}

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

          {/* Single result */}
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

          {/* Compare results */}
          {compareResults != null && (
            <div style={{ marginTop: 24 }}>
              <h2>Comparison</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Object.keys(compareResults).length}, 1fr)`,
                  gap: 12,
                }}
              >
                {Object.entries(compareResults).map(([key, val]) => {
                  const catalystLabel = catalystPresets.find((c) => c.key === key)?.label ?? key;
                  return (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 6,
                        padding: 12,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#555",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {catalystLabel}
                      </div>
                      {typeof val === "string" ? (
                        <p style={{ whiteSpace: "pre-wrap", fontSize: 13, margin: 0 }}>{val}</p>
                      ) : (
                        <pre style={{ ...codeStyle, margin: 0, fontSize: 12 }}>
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
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
                    gap: 6,
                    padding: "7px 8px",
                    background: active ? "#f0f0f0" : "#fff",
                    border: active ? "2px solid #333" : "1px solid #e0e0e0",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#333",
                    textAlign: "left",
                    fontSize: 12,
                    overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{mat.icon}</span>
                  <span
                    style={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom materials */}
          {customMaterials.length > 0 && (
            <>
              <div style={{ ...labelStyle, marginTop: 16, marginBottom: 8 }}>Custom</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {customMaterials.map((mat) => {
                  const active = selectedIds.has(mat.id);
                  return (
                    <div key={mat.id} style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleMaterial(mat.id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 8px",
                          background: active ? "#f0f0f0" : "#fff",
                          border: active ? "2px solid #333" : "1px solid #e0e0e0",
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#333",
                          textAlign: "left",
                          fontSize: 12,
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>
                          {mat.type === "data"
                            ? "\uD83D\uDCCA"
                            : mat.type === "document"
                              ? "\uD83D\uDCC4"
                              : mat.type === "audio"
                                ? "\uD83C\uDFA7"
                                : mat.type === "video"
                                  ? "\uD83C\uDFAC"
                                  : mat.type === "image"
                                    ? "\uD83D\uDDBC\uFE0F"
                                    : "\uD83D\uDCDD"}
                        </span>
                        <span
                          style={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {mat.label}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomMaterial(mat.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "0 2px",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Add custom material buttons */}
          <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {(
                [
                  ["text", "+ Text"],
                  ["image", "+ Image"],
                  ["data", "+ Data"],
                  ["document", "+ Doc"],
                  ["audio", "+ Audio"],
                  ["video", "+ Video"],
                ] as const
              ).map(([key, lbl]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setShowForm(showForm === key ? null : key)}
                  style={{
                    padding: "5px 6px",
                    fontSize: 11,
                    cursor: "pointer",
                    background: showForm === key ? "#f0f0f0" : "#fff",
                    border: showForm === key ? "1px solid #999" : "1px solid #ddd",
                    borderRadius: 4,
                    color: "#555",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {showForm === "text" && (
              <CustomTextForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "image" && (
              <CustomImageForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "data" && (
              <CustomDataForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "document" && (
              <CustomDocumentForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "audio" && (
              <CustomAudioForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
            {showForm === "video" && (
              <CustomVideoForm onAdd={addCustomMaterial} onCancel={() => setShowForm(null)} />
            )}
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
