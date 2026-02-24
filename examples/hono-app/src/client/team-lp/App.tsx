import type { MaterialInput } from "@EdV4H/alchemy-react";
import { useAlchemy } from "@EdV4H/alchemy-react";
import { useCallback, useState } from "react";
import { teamLpCatalystPresets } from "../../team-lp/catalysts.js";
import { teamLpRecipeEntries } from "../../team-lp/recipes.js";
import {
  CustomDataForm,
  CustomDocumentForm,
  CustomImageForm,
  CustomTextForm,
  RecipeInfoPopover,
} from "../shared/components.js";
import { codeStyle, labelStyle } from "../shared/styles.js";
import type { CustomMaterial, MaterialCard } from "../shared/types.js";

// ─── Sample Materials ───────────────────────────────────────────────────────

const allMaterials: MaterialCard[] = [
  // ── Member Profiles ─────────────────────────────────────────────────────────
  {
    id: "member-alice",
    icon: "\uD83D\uDC69\u200D\uD83D\uDCBB",
    label: "Alice Chen — Tech Lead",
    category: "text",
    text: `Alice Chen — Tech Lead
5+ years in distributed systems and cloud architecture. Led the migration of our core platform to microservices, reducing latency by 40%. Passionate about mentoring junior engineers and building scalable, resilient systems. Previously at Google Cloud and a YC startup. Skills: Go, Rust, Kubernetes, gRPC, PostgreSQL.`,
  },
  {
    id: "member-bob",
    icon: "\uD83D\uDC68\u200D\uD83C\uDFA8",
    label: "Bob Tanaka — Design Lead",
    category: "text",
    text: `Bob Tanaka — Design Lead
Award-winning UX/UI designer with 7 years of experience crafting intuitive products. Led the redesign of our dashboard that boosted user engagement by 60%. Advocates for accessibility-first design and design systems. Previously at IDEO and Figma. Skills: Figma, Framer, Design Systems, User Research, Prototyping.`,
  },
  {
    id: "member-carol",
    icon: "\uD83D\uDC69\u200D\uD83D\uDD2C",
    label: "Carol Park — ML Engineer",
    category: "text",
    text: `Carol Park — ML Engineer
Machine learning engineer specializing in NLP and recommendation systems. Built our real-time personalization engine that increased conversion by 25%. Published 3 papers at NeurIPS and ICML. Open source contributor to Hugging Face Transformers. Skills: Python, PyTorch, TensorFlow, MLOps, LLMs.`,
  },

  // ── Team Info ───────────────────────────────────────────────────────────────
  {
    id: "team-mission",
    icon: "\uD83C\uDFAF",
    label: "Team Mission & Vision",
    category: "text",
    text: `Mission: Empower every developer to build AI-powered applications with zero friction.
Vision: A world where AI capabilities are as accessible as a REST API call.
We believe in democratizing AI — making powerful machine learning tools available to teams of all sizes, not just tech giants.`,
  },
  {
    id: "team-goals",
    icon: "\uD83D\uDCCB",
    label: "2025 Team Goals",
    category: "text",
    text: `2025 Team Goals:
Q1: Launch v2.0 of the SDK with streaming support — KPI: 10,000 monthly active developers
Q2: Expand to 3 new languages (Rust, Go, Swift) — KPI: 50% increase in non-JS usage
Q3: Achieve SOC 2 compliance and enterprise readiness — KPI: 5 enterprise contracts signed
Q4: Open-source core engine — KPI: 1,000 GitHub stars in first month
Annual target: $5M ARR, 95% customer satisfaction, <50ms p99 latency.`,
  },
  {
    id: "culture-notes",
    icon: "\uD83C\uDF31",
    label: "Team Culture Notes",
    category: "text",
    text: `Team Culture:
• Async-first: We default to asynchronous communication. Meetings are the exception, not the rule.
• Hackathon Fridays: Every other Friday is dedicated to exploring new ideas and prototypes.
• Open-source Friday: Contribute back to the community on alternating Fridays.
• Blameless post-mortems: We learn from failures without finger-pointing.
• Documentation culture: If it's not documented, it doesn't exist.
• Remote-friendly: Team members across 4 time zones (US, Europe, Japan, Korea).
• Core values: Curiosity, Craftsmanship, Collaboration, Courage.`,
  },

  // ── Photos ──────────────────────────────────────────────────────────────────
  {
    id: "team-photo",
    icon: "\uD83D\uDCF8",
    label: "Team Photo",
    category: "image",
    text: "A team group photo showing the diverse, energetic team in a modern office environment.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  },
  {
    id: "workspace-photo",
    icon: "\uD83C\uDFE2",
    label: "Workspace Photo",
    category: "image",
    text: "A modern, open-plan workspace with standing desks, whiteboards, and natural light.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  },
  {
    id: "team-logo",
    icon: "\uD83C\uDFA8",
    label: "Team Logo",
    category: "image",
    text: "Team logo — a modern, minimal tech brand mark.",
    imageUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800",
  },

  // ── Data ────────────────────────────────────────────────────────────────────
  {
    id: "achievements-csv",
    icon: "\uD83D\uDCCA",
    label: "Team Achievements CSV",
    category: "data",
    text: "Team metrics and achievements data (CSV)",
    dataFormat: "csv",
    dataContent:
      "metric,value,unit,period\nMonthly Active Users,125000,users,2024-Q4\nPlatform Uptime,99.97,%,2024\nCustomer NPS,72,score,2024-Q4\nDeploy Frequency,47,deploys/week,2024-Q4\nMean Time to Recovery,4.2,minutes,2024-Q4\nCode Coverage,94,%,2024-Q4\nOpen Source Stars,8500,stars,2024-12\nTeam Satisfaction,4.6,/5.0,2024-Q4",
  },
  {
    id: "projects-json",
    icon: "\uD83D\uDE80",
    label: "Project Portfolio JSON",
    category: "data",
    text: "Project portfolio data (JSON)",
    dataFormat: "json",
    dataContent: JSON.stringify(
      [
        {
          name: "Alchemy SDK v2",
          challenge: "Developers struggled with complex ML pipelines requiring deep AI expertise",
          solution:
            "Built an intuitive SDK with recipe-based abstractions, streaming support, and auto-optimization",
          result: "10,000+ monthly active developers, 4.8/5 satisfaction score",
          tech: ["TypeScript", "Node.js", "OpenAI", "Streaming API"],
        },
        {
          name: "Real-time Personalization Engine",
          challenge: "E-commerce partners needed sub-100ms personalized recommendations at scale",
          solution: "Designed a hybrid collaborative filtering + LLM system with edge caching",
          result: "25% increase in conversion rate, <50ms p99 latency",
          tech: ["Python", "PyTorch", "Redis", "Kubernetes"],
        },
        {
          name: "Design System 'Aurora'",
          challenge:
            "Inconsistent UI across 12 products led to poor user experience and slow development",
          solution:
            "Created a comprehensive design system with 80+ components, accessibility baked in",
          result: "60% faster feature development, WCAG AA compliance across all products",
          tech: ["React", "Figma", "Storybook", "CSS Variables"],
        },
      ],
      null,
      2,
    ),
  },

  // ── Documents ───────────────────────────────────────────────────────────────
  {
    id: "company-overview",
    icon: "\uD83D\uDCC4",
    label: "Company Overview",
    category: "document",
    text: "Company overview document",
    documentText: `# Alchemy Labs — Company Overview

## About Us
Alchemy Labs is a Series A startup (founded 2022) building the developer platform for AI-native applications. Our tools help engineering teams integrate large language models, computer vision, and ML pipelines into their products without requiring PhD-level AI expertise.

## Key Numbers
- Founded: 2022
- Team Size: 28 people across 6 countries
- Funding: $12M Series A (Sequoia, a16z)
- Customers: 200+ companies including 5 Fortune 500

## Products
1. **Alchemy SDK** — Open-source toolkit for building AI-powered features
2. **Alchemy Cloud** — Managed infrastructure for ML model serving
3. **Alchemy Studio** — No-code AI workflow builder for non-technical teams

## Awards & Recognition
- ProductHunt #1 Product of the Day (March 2024)
- Forbes 30 Under 30 — Alice Chen (2024)
- Best Developer Tool — DevWorld Conference 2024`,
  },
];

// ─── Category groups for the material shelf ─────────────────────────────────

const materialGroups: { header: string; filter: (m: MaterialCard) => boolean }[] = [
  { header: "\uD83D\uDC64 Member Profiles", filter: (m) => m.id.startsWith("member-") },
  {
    header: "\uD83D\uDCDD Team Info",
    filter: (m) => m.category === "text" && !m.id.startsWith("member-"),
  },
  { header: "\uD83D\uDCF7 Photos", filter: (m) => m.category === "image" },
  { header: "\uD83D\uDCCA Data", filter: (m) => m.category === "data" },
  { header: "\uD83D\uDCC4 Documents", filter: (m) => m.category === "document" },
];

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const alchemy = useAlchemy({ initialRecipeId: teamLpRecipeEntries[0].recipe.id });
  const [customMaterials, setCustomMaterials] = useState<CustomMaterial[]>([]);
  const [showForm, setShowForm] = useState<"text" | "image" | "data" | "document" | null>(null);
  const [infoPopoverId, setInfoPopoverId] = useState<string | null>(null);

  const {
    selectedRecipeId,
    selectedIds,
    selectedCatalystKey,
    selectedLanguage,
    compareMode,
    selectedCompareKeys,
    result,
    compareResults,
    isLoading,
    error,
  } = alchemy;

  const selectedEntry = teamLpRecipeEntries.find((e) => e.recipe.id === selectedRecipeId);

  const allSelectableMaterials: (MaterialCard | (CustomMaterial & { icon: string }))[] = [
    ...allMaterials,
    ...customMaterials.map((c) => ({
      ...c,
      icon:
        c.type === "data"
          ? "\uD83D\uDCCA"
          : c.type === "document"
            ? "\uD83D\uDCC4"
            : c.type === "image"
              ? "\uD83D\uDDBC\uFE0F"
              : "\uD83D\uDCDD",
    })),
  ];

  const selectedMaterials = allSelectableMaterials.filter((m) => selectedIds.has(m.id));

  const addCustomMaterial = (m: CustomMaterial) => {
    setCustomMaterials((prev) => [...prev, m]);
    setShowForm(null);
  };

  const removeCustomMaterial = (id: string) => {
    setCustomMaterials((prev) => prev.filter((m) => m.id !== id));
    alchemy.toggleMaterial(id);
  };

  const buildMaterialInputs = useCallback((): MaterialInput[] => {
    return selectedMaterials.flatMap((m): MaterialInput[] => {
      const category = "category" in m ? m.category : undefined;
      if (category === "data" || ("type" in m && m.type === "data")) {
        const dc = "dataContent" in m ? m.dataContent : undefined;
        const df = "dataFormat" in m ? m.dataFormat : undefined;
        if (dc && df) {
          return [{ type: "data", dataFormat: df, dataContent: dc, dataLabel: m.label }];
        }
      } else if (category === "document" || ("type" in m && m.type === "document")) {
        const dt = "documentText" in m ? m.documentText : undefined;
        if (dt) {
          return [{ type: "document", documentText: dt }];
        }
      } else {
        const inputs: MaterialInput[] = [];
        if ("text" in m && m.text) inputs.push({ type: "text", text: m.text });
        if ("imageUrl" in m && m.imageUrl) inputs.push({ type: "image", imageUrl: m.imageUrl });
        return inputs;
      }
      return [];
    });
  }, [selectedMaterials]);

  const handleTransmute = useCallback(
    () => alchemy.transmute(buildMaterialInputs()),
    [alchemy.transmute, buildMaterialInputs],
  );

  const handleCompare = useCallback(
    () => alchemy.compare(buildMaterialInputs()),
    [alchemy.compare, buildMaterialInputs],
  );

  const hasSelection = selectedMaterials.length > 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
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
        {/* Left: Recipe + Transmute */}
        <div>
          <h1>Team LP Generator</h1>
          <p style={{ color: "#888", marginTop: -8, marginBottom: 16, fontSize: 14 }}>
            {"\u30C1\u30FC\u30E0LP\u3092\u932C\u91D1\u3059\u308B"}
          </p>

          {/* Recipe selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
            {teamLpRecipeEntries.map((entry) => {
              const active = entry.recipe.id === selectedRecipeId;
              return (
                <button
                  type="button"
                  key={entry.recipe.id}
                  onClick={() => {
                    alchemy.selectRecipe(entry.recipe.id);
                    setInfoPopoverId(null);
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

          {/* Catalyst selector */}
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...labelStyle, margin: 0 }}>Catalyst</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!compareMode) {
                      alchemy.selectCatalyst(null);
                      alchemy.resetResults();
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
                {teamLpCatalystPresets.map((cat) => {
                  const isSelected = compareMode
                    ? selectedCompareKeys.includes(cat.key)
                    : selectedCatalystKey === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => {
                        if (compareMode) {
                          alchemy.toggleCompareKey(cat.key);
                        } else {
                          alchemy.selectCatalyst(cat.key);
                          alchemy.resetResults();
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
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#888" }}>Language</span>
                <select
                  value={selectedLanguage ?? ""}
                  onChange={(e) => alchemy.setLanguage(e.target.value || null)}
                  style={{
                    padding: "3px 6px",
                    fontSize: 12,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#fff",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Auto</option>
                  <option value="English">English</option>
                  <option value="Japanese">日本語</option>
                  <option value="Chinese">中文</option>
                  <option value="Korean">한국어</option>
                </select>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={compareMode}
                    onChange={(e) => {
                      const on = e.target.checked;
                      alchemy.setCompareMode(on);
                      alchemy.resetResults();
                      if (on) {
                        alchemy.setCompareKeys(teamLpCatalystPresets.map((c) => c.key));
                      }
                    }}
                  />
                  Compare
                </label>
              </div>
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
                    alchemy.clearSelection();
                    alchemy.resetResults();
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
              {
                "\u30C1\u30FC\u30E0\u306E\u7D20\u6750\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"
              }{" "}
              &rarr;
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

          {/* Single result — HTML rendered */}
          {result != null && (
            <div style={{ marginTop: 24 }}>
              <h2>Result</h2>
              {typeof result === "string" ? (
                <>
                  <div
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      padding: 16,
                      marginBottom: 12,
                    }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML rendering from LLM output
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                  <details>
                    <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>
                      View HTML Source
                    </summary>
                    <pre style={{ ...codeStyle, marginTop: 8, fontSize: 12 }}>{result}</pre>
                  </details>
                </>
              ) : (
                <pre style={codeStyle}>{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          )}

          {/* Compare results — HTML rendered */}
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
                  const catalystLabel =
                    teamLpCatalystPresets.find((c) => c.key === key)?.label ?? key;
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
                        <>
                          <div
                            style={{ fontSize: 13 }}
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML rendering from LLM output
                            dangerouslySetInnerHTML={{ __html: val }}
                          />
                          <details style={{ marginTop: 8 }}>
                            <summary style={{ cursor: "pointer", fontSize: 11, color: "#aaa" }}>
                              HTML Source
                            </summary>
                            <pre
                              style={{
                                ...codeStyle,
                                margin: "4px 0 0",
                                fontSize: 10,
                                maxHeight: 200,
                              }}
                            >
                              {val}
                            </pre>
                          </details>
                        </>
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

        {/* Right: Material Shelf */}
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

          {/* Grouped materials with category headers */}
          {materialGroups.map((group) => {
            const items = allMaterials.filter(group.filter);
            if (items.length === 0) return null;
            return (
              <div key={group.header} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#999",
                    marginBottom: 6,
                    paddingBottom: 2,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {group.header}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {items.map((mat) => {
                    const active = selectedIds.has(mat.id);
                    return (
                      <button
                        type="button"
                        key={mat.id}
                        onClick={() => alchemy.toggleMaterial(mat.id)}
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
              </div>
            );
          })}

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
                        onClick={() => alchemy.toggleMaterial(mat.id)}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
              {(
                [
                  ["text", "+ Text"],
                  ["image", "+ Image"],
                  ["data", "+ Data"],
                  ["document", "+ Doc"],
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
