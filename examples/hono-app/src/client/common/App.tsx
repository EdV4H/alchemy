import { catalystPresets } from "../../shared/catalysts.js";
import { recipeEntries } from "../../shared/recipes.js";
import { AlchemyDemoApp } from "../shared/AlchemyDemoApp.js";
import type { MaterialCard } from "../shared/types.js";

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

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <AlchemyDemoApp
      title="Alchemy Demo"
      materials={allMaterials}
      recipeEntries={recipeEntries}
      catalystPresets={catalystPresets}
    />
  );
}
