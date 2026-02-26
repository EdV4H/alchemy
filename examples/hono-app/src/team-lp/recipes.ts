import type { MaterialPart, Recipe } from "@edv4h/alchemy-node";
import { extractText, TextRefiner, truncateText } from "@edv4h/alchemy-node";
import type { RecipeEntry } from "../shared/recipes.js";

// ─── Recipe 1: Hero Section ─────────────────────────────────────────────────
// ヒーローセクション — HTML output

export const teamHeroRecipe: Recipe<MaterialPart[], string> = {
  id: "team-hero",
  name: "Hero Section",
  catalyst: {
    roleDefinition:
      "You are an expert landing page designer. Generate a compelling hero section as semantic HTML with inline styles. Include a headline, tagline, mission statement, and a call-to-action button. Use modern, responsive CSS. If a response language is specified, write all visible text content (headings, paragraphs, buttons) in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.5,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following team materials, generate a hero section for a team landing page as a single HTML fragment with inline styles. Include: a bold headline, a tagline, a brief mission statement, and a CTA button. Make it visually striking:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 2: Member Profile Cards ─────────────────────────────────────────
// メンバーカードグリッド — HTML output

export const teamMembersRecipe: Recipe<MaterialPart[], string> = {
  id: "team-members",
  name: "Member Profile Cards",
  catalyst: {
    roleDefinition:
      "You are a UI designer specializing in profile cards. Generate a responsive grid of member profile cards as semantic HTML with inline styles. Each card should include the member's name, role, a brief bio, and skills. If a response language is specified, write all visible text content in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.5,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following team member profiles, generate a responsive card grid as HTML with inline styles. Each card should display: name, role/title, a short bio, and key skills or expertise areas:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 3: Achievements & Stats ─────────────────────────────────────────
// 数値ハイライト — HTML output

export const teamAchievementsRecipe: Recipe<MaterialPart[], string> = {
  id: "team-achievements",
  name: "Achievements & Stats",
  catalyst: {
    roleDefinition:
      "You are a data visualization specialist for landing pages. Generate an achievements/stats section as semantic HTML with inline styles. Display key metrics prominently with large numbers, labels, and subtle animations hints via CSS. If a response language is specified, write all visible text content (labels, descriptions) in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.4,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Using the following team data, generate an achievements & stats section as HTML with inline styles. Display key metrics as large, prominent numbers with labels. Use a visually appealing grid layout:

${text}`;
  },
  refiner: new TextRefiner(),
  transforms: [truncateText(6000)],
};

// ─── Recipe 4: Team Culture & Values ────────────────────────────────────────
// コアバリュー + 文化紹介 — HTML output

export const teamCultureRecipe: Recipe<MaterialPart[], string> = {
  id: "team-culture",
  name: "Team Culture & Values",
  catalyst: {
    roleDefinition:
      "You are a culture branding specialist. Generate a team culture and values section as semantic HTML with inline styles. Present core values with icons (use emoji), descriptions, and a narrative about team culture. If a response language is specified, write all visible text content in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.6,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following team culture notes and information, generate a 'Culture & Values' section for a landing page as HTML with inline styles. Include core values with emoji icons, short descriptions, and a narrative paragraph about the team's culture:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 5: Project Showcase ─────────────────────────────────────────────
// 課題→解決→成果カード — HTML output

export const teamProjectsRecipe: Recipe<MaterialPart[], string> = {
  id: "team-projects",
  name: "Project Showcase",
  catalyst: {
    roleDefinition:
      "You are a portfolio designer. Generate a project showcase section as semantic HTML with inline styles. Each project card should follow a Challenge → Solution → Result structure. If a response language is specified, write all visible text content in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.5,
  },
  spell: (parts) => {
    const text = extractText(parts);
    return `Using the following project data, generate a project showcase section as HTML with inline styles. Each project should be displayed as a card with: project name, challenge faced, solution implemented, and measurable results:

${text}`;
  },
  refiner: new TextRefiner(),
  transforms: [truncateText(6000)],
};

// ─── Recipe 6: Why Join Us? / FAQ ───────────────────────────────────────────
// 入社理由 + details/summary FAQ — HTML output

export const teamWhyJoinRecipe: Recipe<MaterialPart[], string> = {
  id: "team-why-join",
  name: "Why Join Us? / FAQ",
  catalyst: {
    roleDefinition:
      "You are a talent acquisition copywriter. Generate a 'Why Join Us?' section followed by an FAQ accordion as semantic HTML with inline styles. Use <details>/<summary> elements for the FAQ. If a response language is specified, write all visible text content in that language. Output only the HTML fragment — no markdown fences, no explanation.",
    temperature: 0.6,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using the following team information, generate a 'Why Join Us?' section with compelling reasons to join, followed by an FAQ section using HTML <details>/<summary> elements. Style with inline CSS:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe 7: Full Page Assembler ──────────────────────────────────────────
// 全セクション一括生成 — HTML output

export const teamFullPageRecipe: Recipe<MaterialPart[], string> = {
  id: "team-full-page",
  name: "Full Page Assembler",
  catalyst: {
    roleDefinition:
      "You are a full-stack landing page designer. Generate a complete, single-page team landing page as semantic HTML with inline styles. Include all major sections: hero, about/mission, team members, achievements, culture & values, project showcase, why join us, and a footer. If a response language is specified, write all visible text content in that language. Output only the HTML — no markdown fences, no explanation.",
    temperature: 0.6,
  },
  spell: (parts) => [
    {
      type: "text",
      text: "Using all the following team materials, generate a complete team landing page as a single HTML document with inline styles. Include these sections in order: Hero (headline + tagline + CTA), About/Mission, Team Members (card grid), Achievements & Stats, Culture & Values, Project Showcase, Why Join Us + FAQ, and Footer. Make it cohesive and visually polished:",
    },
    ...parts,
  ],
  refiner: new TextRefiner(),
};

// ─── Recipe Registry ────────────────────────────────────────────────────────

export const teamLpRecipeEntries: RecipeEntry[] = [
  {
    recipe: teamHeroRecipe,
    label: "Hero Section",
    icon: "\uD83C\uDFAF",
    description: "Generate a striking hero section with headline, tagline, and CTA",
    meta: {
      outputType: "text",
      transforms: ["imageUrlToBase64()"],
      promptTemplate:
        "Generate a hero section HTML with headline, tagline, mission, and CTA ...materials",
    },
  },
  {
    recipe: teamMembersRecipe,
    label: "Member Cards",
    icon: "\uD83D\uDC65",
    description: "Create a responsive grid of team member profile cards",
    meta: {
      outputType: "text",
      transforms: ["imageUrlToBase64()"],
      promptTemplate: "Generate member profile cards grid HTML from team profiles ...materials",
    },
  },
  {
    recipe: teamAchievementsRecipe,
    label: "Achievements",
    icon: "\uD83C\uDFC6",
    description: "Display key metrics and team achievements as visual stats",
    meta: {
      outputType: "text",
      transforms: ["dataToText()", "truncateText(6000)"],
      promptTemplate: "Generate achievements & stats section HTML from team data ...materials",
    },
  },
  {
    recipe: teamCultureRecipe,
    label: "Culture",
    icon: "\uD83C\uDF31",
    description: "Showcase team culture, core values, and work philosophy",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate: "Generate culture & values section HTML from team culture notes ...materials",
    },
  },
  {
    recipe: teamProjectsRecipe,
    label: "Projects",
    icon: "\uD83D\uDE80",
    description: "Showcase projects with challenge, solution, and results",
    meta: {
      outputType: "text",
      transforms: ["dataToText()", "truncateText(6000)"],
      promptTemplate:
        "Generate project showcase HTML with challenge/solution/result cards ...materials",
    },
  },
  {
    recipe: teamWhyJoinRecipe,
    label: "Why Join",
    icon: "\uD83E\uDD1D",
    description: "Create a compelling 'Why Join Us?' section with FAQ accordion",
    meta: {
      outputType: "text",
      transforms: [],
      promptTemplate:
        "Generate 'Why Join Us?' section + FAQ accordion HTML from team info ...materials",
    },
  },
  {
    recipe: teamFullPageRecipe,
    label: "Full Page",
    icon: "\uD83D\uDCDC",
    description: "Assemble a complete team landing page with all sections",
    meta: {
      outputType: "text",
      transforms: ["imageUrlToBase64()", "dataToText()"],
      promptTemplate: "Generate complete team landing page HTML from all materials ...materials",
    },
  },
];

// biome-ignore lint/suspicious/noExplicitAny: recipe output types vary
export const teamLpRecipeRegistry: Record<string, Recipe<MaterialPart[], any>> = Object.fromEntries(
  teamLpRecipeEntries.map((e) => [e.recipe.id, e.recipe]),
);
