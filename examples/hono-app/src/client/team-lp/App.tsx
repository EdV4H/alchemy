import { teamLpCatalystPresets } from "../../team-lp/catalysts.js";
import { teamLpRecipeEntries } from "../../team-lp/recipes.js";
import { AlchemyDemoApp } from "../shared/AlchemyDemoApp.js";
import type { MaterialCard } from "../shared/types.js";

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
\u2022 Async-first: We default to asynchronous communication. Meetings are the exception, not the rule.
\u2022 Hackathon Fridays: Every other Friday is dedicated to exploring new ideas and prototypes.
\u2022 Open-source Friday: Contribute back to the community on alternating Fridays.
\u2022 Blameless post-mortems: We learn from failures without finger-pointing.
\u2022 Documentation culture: If it's not documented, it doesn't exist.
\u2022 Remote-friendly: Team members across 4 time zones (US, Europe, Japan, Korea).
\u2022 Core values: Curiosity, Craftsmanship, Collaboration, Courage.`,
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
  return (
    <AlchemyDemoApp
      title="Team LP Generator"
      subtitle={"\u30C1\u30FC\u30E0LP\u3092\u932C\u91D1\u3059\u308B"}
      emptyMessage={
        "\u30C1\u30FC\u30E0\u306E\u7D20\u6750\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"
      }
      materials={allMaterials}
      recipeEntries={teamLpRecipeEntries}
      catalystPresets={teamLpCatalystPresets}
      materialGroups={materialGroups}
      customMaterialTypes={["text", "image", "data", "document"]}
      resultMode="html"
    />
  );
}
