import { useCallback, useState } from "react";
import { travelCatalystPresets } from "../../travel/catalysts.js";
import { travelRecipeEntries } from "../../travel/recipes.js";
import {
  CustomAudioForm,
  CustomDataForm,
  CustomDocumentForm,
  CustomImageForm,
  CustomTextForm,
  CustomVideoForm,
  RecipeInfoPopover,
} from "../shared/components.js";
import { codeStyle, labelStyle } from "../shared/styles.js";
import type { CustomMaterial, MaterialCard, MaterialInput } from "../shared/types.js";

// ─── Sample Materials ───────────────────────────────────────────────────────

const allMaterials: MaterialCard[] = [
  // ── Texts ─────────────────────────────────────────────────────────────────
  {
    id: "diary-day1",
    icon: "\uD83D\uDCDD",
    label: "\u65C5\u65E5\u8A18 Day 1 \u6771\u4EAC",
    category: "text",
    text: "\u6210\u7530\u7A7A\u6E2F\u306B\u5230\u7740\u3002\u96FB\u8ECA\u3067\u6771\u4EAC\u99C5\u3078\u3002\u4E38\u306E\u5185\u306E\u9AD8\u5C64\u30D3\u30EB\u7FA4\u306B\u5727\u5012\u3055\u308C\u305F\u3002\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3\u5F8C\u3001\u65B0\u5BBF\u306E\u601D\u3044\u51FA\u6A2A\u4E01\u3067\u713C\u304D\u9CE5\u3068\u751F\u30D3\u30FC\u30EB\u3002\u96A3\u306E\u5E2D\u306E\u30B5\u30E9\u30EA\u30FC\u30DE\u30F3\u3068\u4E7E\u676F\u3002\u591C\u306E\u6B4C\u821E\u4F0E\u753A\u306E\u30CD\u30AA\u30F3\u304C\u7729\u3057\u304B\u3063\u305F\u3002",
  },
  {
    id: "diary-day3",
    icon: "\uD83D\uDCDD",
    label: "\u65C5\u65E5\u8A18 Day 3 \u4EAC\u90FD",
    category: "text",
    text: "\u65E9\u67085\u6642\u306B\u8D77\u304D\u3066\u4F0F\u898B\u7A32\u8377\u3078\u3002\u5343\u672C\u9CE5\u5C45\u3092\u72EC\u308A\u5360\u3081\u3002\u671D\u306E\u5149\u304C\u6731\u8272\u306E\u9CE5\u5C45\u3092\u901A\u308A\u629C\u3051\u308B\u77AC\u9593\u306F\u606F\u3092\u5451\u3093\u3060\u3002\u5348\u5F8C\u306F\u5D50\u5C71\u306E\u7AF9\u6797\u3092\u6563\u7B56\u3002\u4EBA\u529B\u8ECA\u306B\u4E57\u3063\u3066\u4FDD\u6D25\u5DDD\u6CBF\u3044\u3092\u8D70\u3063\u305F\u3002\u591C\u306F\u7947\u5712\u3067\u821E\u5993\u3055\u3093\u3092\u898B\u304B\u3051\u305F\u3002",
  },
  {
    id: "diary-day5",
    icon: "\uD83D\uDCDD",
    label: "\u65C5\u65E5\u8A18 Day 5 \u5927\u962A",
    category: "text",
    text: "\u9053\u9813\u5800\u306E\u30B0\u30EA\u30B3\u770B\u677F\u306E\u524D\u3067\u8A18\u5FF5\u64AE\u5F71\u3002\u305F\u3053\u713C\u304D\u30923\u8ED2\u306F\u3057\u3054\u3002\u304F\u304F\u308B\u306E\u305F\u3053\u713C\u304D\u304C\u4E00\u756A\u7F8E\u5473\u3057\u304B\u3063\u305F\u3002\u901A\u5929\u95A3\u304B\u3089\u5927\u962A\u306E\u8857\u3092\u4E00\u671B\u3002\u65B0\u4E16\u754C\u3067\u4E32\u30AB\u30C4\u3068\u30D3\u30FC\u30EB\u3002\u300C\u4E8C\u5EA6\u3065\u3051\u7981\u6B62\u300D\u306E\u30EB\u30FC\u30EB\u3092\u5B66\u3093\u3060\u3002",
  },
  {
    id: "review-kappo",
    icon: "\uD83C\uDF7D\uFE0F",
    label: "\u4EAC\u90FD \u5272\u70F9\u30EC\u30D3\u30E5\u30FC",
    category: "text",
    text: "\u7947\u5712\u306E\u96A0\u308C\u5BB6\u5272\u70F9\u300C\u677E\u5DDD\u300D\u3002\u30AB\u30A6\u30F3\u30BF\u30FC8\u5E2D\u306E\u307F\u3002\u5148\u4ED8\u306E\u6E6F\u8449\u8C46\u8150\u3001\u6900\u7269\u306E\u9C67\u3001\u713C\u7269\u306E\u9BAE\u3001\u3069\u308C\u3082\u7D76\u54C1\u3002\u5927\u5C06\u3068\u306E\u4F1A\u8A71\u3082\u697D\u3057\u3044\u3002\u65E5\u672C\u9152\u306E\u30DA\u30A2\u30EA\u30F3\u30B0\u304C\u7D20\u6674\u3089\u3057\u304B\u3063\u305F\u3002\u4E88\u7B97\u306F1\u4EBA15,000\u5186\u307B\u3069\u3002\u8981\u4E88\u7D04\u3002",
  },
  {
    id: "review-ryokan",
    icon: "\uD83C\uDFE8",
    label: "\u4EAC\u90FD \u65C5\u9928\u30EC\u30D3\u30E5\u30FC",
    category: "text",
    text: "\u5D50\u5C71\u306E\u8001\u8217\u65C5\u9928\u300C\u7FE0\u5D50\u300D\u306B\u5BBF\u6CCA\u3002\u4FDD\u6D25\u5DDD\u3092\u671B\u3080\u9732\u5929\u98A8\u5442\u4ED8\u304D\u5BA2\u5BA4\u3002\u7573\u306E\u9999\u308A\u3068\u5DDD\u306E\u305B\u305B\u3089\u304E\u3067\u6700\u9AD8\u306E\u7761\u7720\u3002\u671D\u98DF\u306E\u6E6F\u8C46\u8150\u5FA1\u81B3\u304C\u7D76\u54C1\u3002\u4EF2\u5C45\u3055\u3093\u306E\u304A\u3082\u3066\u306A\u3057\u306B\u611F\u52D5\u30021\u6CCA45,000\u5186\uFF5E\u3060\u304C\u3001\u305D\u308C\u3060\u3051\u306E\u4FA1\u5024\u3042\u308A\u3002",
  },
  {
    id: "travel-notes",
    icon: "\uD83D\uDDD2\uFE0F",
    label: "\u65C5\u306E\u30E1\u30E2",
    category: "text",
    text: "\u3010\u6301\u3063\u3066\u3044\u3063\u3066\u3088\u304B\u3063\u305F\u3082\u306E\u3011\u30DD\u30B1\u30C3\u30C8WiFi\u3001\u6298\u308A\u305F\u305F\u307F\u5098\u3001\u6B69\u304D\u3084\u3059\u3044\u9774\n\u3010\u5931\u6557\u3057\u305F\u3053\u3068\u3011\u4EAC\u90FD\u306E\u30D0\u30B9\u306F\u6DF7\u307F\u3059\u304E\u2192\u5730\u4E0B\u9244\u63A8\u5968\n\u3010\u6B21\u56DE\u3084\u308A\u305F\u3044\u3053\u3068\u3011\u5948\u826F\u306E\u9E7F\u516C\u5712\u3001\u9AD8\u91CE\u5C71\u3001\u76F4\u5CF6\n\u3010\u899A\u3048\u3066\u304A\u304F\u30D5\u30EC\u30FC\u30BA\u3011\u3059\u307F\u307E\u305B\u3093\u3001\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3001\u304A\u4F1A\u8A08\u304A\u9858\u3044\u3057\u307E\u3059",
  },
  {
    id: "quick-notes-en",
    icon: "\uD83D\uDCCB",
    label: "Quick Travel Notes",
    category: "text",
    text: "Japan trip essentials: Get a 7-day JR Pass (worth it for bullet trains). IC card (Suica/ICOCA) for local transit. Convenience stores (7-Eleven, Lawson) are lifesavers \u2014 great food, ATMs, and wifi. Cash still king in many places. Temples close early (4-5pm). Best ramen: Ichiran in Shinjuku.",
  },
  {
    id: "culture-notes",
    icon: "\u26E9\uFE0F",
    label: "\u6587\u5316\u30E1\u30E2",
    category: "text",
    text: "\u9774\u3092\u8131\u3050\u6587\u5316\uFF1A\u65C5\u9928\u3001\u5BFA\u9662\u3001\u4E00\u90E8\u306E\u30EC\u30B9\u30C8\u30E9\u30F3\u3067\u306F\u9774\u3092\u8131\u3050\u3002\u6E29\u6CC9\u30DE\u30CA\u30FC\uFF1A\u5165\u308B\u524D\u306B\u4F53\u3092\u6D17\u3046\u3001\u30BF\u30AA\u30EB\u306F\u6E6F\u8239\u306B\u5165\u308C\u306A\u3044\u3002\u96FB\u8ECA\u30DE\u30CA\u30FC\uFF1A\u643A\u5E2F\u306F\u97F3\u3092\u6D88\u3059\u3001\u512A\u5148\u5E2D\u306B\u6CE8\u610F\u3002\u30C1\u30C3\u30D7\u6587\u5316\u306A\u3057\u3002\u304A\u8F9E\u5100\u306E\u6DF1\u3055\u3067\u656C\u610F\u3092\u8868\u3059\u3002",
  },
  {
    id: "omiyage-list",
    icon: "\uD83C\uDF81",
    label: "\u304A\u571F\u7523\u30EA\u30B9\u30C8",
    category: "text",
    text: "\u6771\u4EAC\uFF1A\u6771\u4EAC\u3070\u306A\u5948\u3001\u96F7\u304A\u3053\u3057\uFF08\u6D45\u8349\uFF09\n\u4EAC\u90FD\uFF1A\u516B\u30C3\u6A4B\uFF08\u8056\u8B77\u9662\uFF09\u3001\u62B9\u8336\u30B9\u30A4\u30FC\u30C4\uFF08\u4E2D\u6751\u85E4\u5409\uFF09\u3001\u3061\u308A\u3081\u3093\u5C71\u6912\n\u5927\u962A\uFF1A551\u306E\u8C5A\u307E\u3093\u3001\u308A\u304F\u308D\u30FC\u304A\u3058\u3055\u3093\u306E\u30C1\u30FC\u30BA\u30B1\u30FC\u30AD\n\u5171\u901A\uFF1A\u65E5\u672C\u9152\u30DF\u30CB\u30DC\u30C8\u30EB\u3001\u624B\u306C\u3050\u3044\u3001\u7B38\u30BB\u30C3\u30C8",
  },

  // ── Images ────────────────────────────────────────────────────────────────
  {
    id: "fushimi-inari",
    icon: "\u26E9\uFE0F",
    label: "\u4F0F\u898B\u7A32\u8377 \u5343\u672C\u9CE5\u5C45",
    category: "image",
    text: "Describe the atmosphere, colors, and cultural significance of this Fushimi Inari shrine photo.",
    imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800",
  },
  {
    id: "tokyo-night",
    icon: "\uD83C\uDF03",
    label: "\u6771\u4EAC \u591C\u666F",
    category: "image",
    text: "Describe the cityscape, lights, and mood of this Tokyo night scene.",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
  },
  {
    id: "arashiyama-bamboo",
    icon: "\uD83C\uDF8B",
    label: "\u5D50\u5C71 \u7AF9\u6797",
    category: "image",
    text: "Describe the atmosphere, scale, and natural beauty of this Arashiyama bamboo grove.",
    imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
  },

  // ── Documents ─────────────────────────────────────────────────────────────
  {
    id: "travel-itinerary",
    icon: "\uD83D\uDCC4",
    label: "\u65C5\u306E\u3057\u304A\u308A",
    category: "document",
    text: "7-day Japan itinerary document",
    documentText:
      "# \u65E5\u672C\u65C5\u884C 7\u65E5\u9593\u306E\u3057\u304A\u308A\n\n## Day 1-2: \u6771\u4EAC\n- \u6210\u7530\u7A7A\u6E2F \u2192 \u6771\u4EAC\u99C5\uFF08\u6210\u7530\u30A8\u30AF\u30B9\u30D7\u30EC\u30B9\uFF09\n- \u6D45\u8349\u5BFA\u30FB\u4EF2\u898B\u4E16\u901A\u308A\u6563\u7B56\n- \u79CB\u8449\u539F\u3067\u30AC\u30B8\u30A7\u30C3\u30C8\u5DE1\u308A\n- \u65B0\u5BBF\u5FA1\u82D1\u3067\u82B1\u898B\n- \u6E0B\u8C37\u30B9\u30AF\u30E9\u30F3\u30D6\u30EB\u4EA4\u5DEE\u70B9\n- \u7BC9\u5730\u5834\u5916\u5E02\u5834\u3067\u671D\u98DF\n\n## Day 3-4: \u4EAC\u90FD\n- \u65B0\u5E79\u7DDA\u3067\u4EAC\u90FD\u3078\uFF08\u306E\u305E\u307F\u3001\u7D042\u6642\u959315\u5206\uFF09\n- \u4F0F\u898B\u7A32\u8377\u5927\u793E\uFF08\u65E9\u671D\u63A8\u5968\uFF09\n- \u91D1\u95A3\u5BFA\u30FB\u9280\u95A3\u5BFA\n- \u5D50\u5C71\u7AF9\u6797\u30FB\u6E21\u6708\u6A4B\n- \u7947\u5712\u6563\u7B56\u30FB\u82B1\u898B\u5C0F\u8DEF\n- \u6E05\u6C34\u5BFA\uFF08\u591C\u9593\u30E9\u30A4\u30C8\u30A2\u30C3\u30D7\uFF09\n\n## Day 5-6: \u5927\u962A\n- JR\u3067\u5927\u962A\u3078\uFF08\u7D0430\u5206\uFF09\n- \u9053\u9813\u5800\u30FB\u5FC3\u658E\u6A4B\u7B4B\n- \u5927\u962A\u57CE\u516C\u5712\n- \u901A\u5929\u95A3\u30FB\u65B0\u4E16\u754C\n- \u9ED2\u9580\u5E02\u5834\u3067\u98DF\u3079\u6B69\u304D\n- \u30E6\u30CB\u30D0\u30FC\u30B5\u30EB\u30FB\u30B9\u30BF\u30B8\u30AA\u30FB\u30B8\u30E3\u30D1\u30F3\n\n## Day 7: \u5E30\u8DEF\n- \u65B0\u5927\u962A \u2192 \u95A2\u897F\u7A7A\u6E2F\uFF08\u306F\u308B\u304B\uFF09\n- \u7A7A\u6E2F\u3067\u304A\u571F\u7523\u8CFC\u5165\n\n## \u4E88\u7B97\u76EE\u5B89\n- JR Pass 7\u65E5\u9593: \u00A529,650\n- \u5BBF\u6CCA\uFF086\u6CCA\uFF09: \u00A5120,000\n- \u98DF\u8CBB: \u00A560,000\n- \u89B3\u5149\u30FB\u4EA4\u901A: \u00A530,000\n- \u304A\u571F\u7523: \u00A520,000\n- \u5408\u8A08: \u7D04 \u00A5260,000",
  },

  // ── Data ──────────────────────────────────────────────────────────────────
  {
    id: "expense-csv",
    icon: "\uD83D\uDCCA",
    label: "\u65C5\u884C\u8CBB\u7528 CSV",
    category: "data",
    text: "Travel expense data (CSV)",
    dataFormat: "csv",
    dataContent:
      "date,category,item,amount_jpy,city\n2025-03-01,transport,Narita Express,3250,Tokyo\n2025-03-01,food,Yakitori dinner,2800,Tokyo\n2025-03-01,accommodation,Hotel check-in,12000,Tokyo\n2025-03-02,food,Tsukiji breakfast,1500,Tokyo\n2025-03-02,activity,Senso-ji area,500,Tokyo\n2025-03-02,food,Ramen lunch,1100,Tokyo\n2025-03-02,transport,Suica charge,2000,Tokyo\n2025-03-03,transport,Shinkansen to Kyoto,0,Kyoto\n2025-03-03,food,Matcha & wagashi,800,Kyoto\n2025-03-03,activity,Fushimi Inari,0,Kyoto\n2025-03-03,accommodation,Ryokan,45000,Kyoto\n2025-03-04,food,Kaiseki dinner,15000,Kyoto\n2025-03-04,activity,Bamboo grove rickshaw,3000,Kyoto\n2025-03-04,shopping,Kyoto souvenirs,5000,Kyoto\n2025-03-05,transport,JR to Osaka,0,Osaka\n2025-03-05,food,Takoyaki crawl,1800,Osaka\n2025-03-05,food,Kushikatsu dinner,3500,Osaka\n2025-03-05,accommodation,Hotel,9000,Osaka\n2025-03-06,activity,USJ ticket,8600,Osaka\n2025-03-06,food,USJ lunch,2200,Osaka\n2025-03-06,shopping,Osaka souvenirs,4000,Osaka\n2025-03-07,transport,Haruka to KIX,1800,Osaka\n2025-03-07,shopping,Airport souvenirs,6000,Osaka",
  },
  {
    id: "spots-json",
    icon: "\uD83D\uDCCD",
    label: "\u8A2A\u554F\u30B9\u30DD\u30C3\u30C8 JSON",
    category: "data",
    text: "Visited spots data (JSON)",
    dataFormat: "json",
    dataContent:
      '[{"name":"\u6D45\u8349\u5BFA","city":"Tokyo","rating":4,"category":"temple"},{"name":"\u4F0F\u898B\u7A32\u8377\u5927\u793E","city":"Kyoto","rating":5,"category":"shrine"},{"name":"\u5D50\u5C71\u7AF9\u6797","city":"Kyoto","rating":5,"category":"nature"},{"name":"\u91D1\u95A3\u5BFA","city":"Kyoto","rating":4,"category":"temple"},{"name":"\u9053\u9813\u5800","city":"Osaka","rating":4,"category":"street"},{"name":"\u901A\u5929\u95A3","city":"Osaka","rating":3,"category":"landmark"},{"name":"\u5927\u962A\u57CE","city":"Osaka","rating":4,"category":"castle"},{"name":"\u6E05\u6C34\u5BFA","city":"Kyoto","rating":5,"category":"temple"}]',
  },
  {
    id: "packing-tsv",
    icon: "\uD83E\uDDF3",
    label: "\u6301\u3061\u7269\u30C1\u30A7\u30C3\u30AF TSV",
    category: "data",
    text: "Packing checklist (TSV)",
    dataFormat: "tsv",
    dataContent:
      "item\tcategory\tpacked\tused\nPassport\tessential\tyes\tyes\nJR Pass\ttransport\tyes\tyes\nPocket WiFi\ttech\tyes\tyes\nPower adapter\ttech\tyes\tyes\nUmbrella\tclothing\tyes\tyes\nComfortable shoes\tclothing\tyes\tyes\nJapanese phrasebook\tmisc\tyes\tno\nMotion sickness pills\thealth\tyes\tno\nSunscreen\thealth\tyes\tyes\nReusable water bottle\tmisc\tyes\tyes",
  },

  // ── Audio ─────────────────────────────────────────────────────────────────
  {
    id: "voice-memo",
    icon: "\uD83C\uDF99\uFE0F",
    label: "\u65C5\u306E\u97F3\u58F0\u30E1\u30E2",
    category: "audio",
    text: "Audio memo recorded at Fushimi Inari shrine (stub: transcription not yet available)",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },

  // ── Video ─────────────────────────────────────────────────────────────────
  {
    id: "travel-vlog",
    icon: "\uD83C\uDFAC",
    label: "\u65C5\u884CVlog \u30AF\u30EA\u30C3\u30D7",
    category: "video",
    text: "Short vlog clip from Arashiyama bamboo grove (stub: frame extraction not yet available)",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

// ─── Category groups for the material shelf ─────────────────────────────────

const materialGroups: { header: string; filter: (m: MaterialCard) => boolean }[] = [
  { header: "\uD83D\uDCDD Texts & Notes", filter: (m) => m.category === "text" },
  { header: "\uD83D\uDCF7 Photos", filter: (m) => m.category === "image" },
  { header: "\uD83D\uDCC4 Documents", filter: (m) => m.category === "document" },
  { header: "\uD83D\uDCCA Data", filter: (m) => m.category === "data" },
  { header: "\uD83C\uDFA7 Audio", filter: (m) => m.category === "audio" },
  { header: "\uD83C\uDFAC Video", filter: (m) => m.category === "video" },
];

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(travelRecipeEntries[0].recipe.id);
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

  const selectedEntry = travelRecipeEntries.find((e) => e.recipe.id === selectedRecipeId);

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
          <h1>Travel Memory Alchemy</h1>
          <p style={{ color: "#888", marginTop: -8, marginBottom: 16, fontSize: 14 }}>
            {"\u65C5\u306E\u601D\u3044\u51FA\u3092\u932C\u91D1\u3059\u308B"}
          </p>

          {/* Recipe selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
            {travelRecipeEntries.map((entry) => {
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

          {/* Catalyst selector */}
          <div style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...labelStyle, margin: 0 }}>Catalyst</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                {travelCatalystPresets.map((cat) => {
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
                      setSelectedCompareKeys(travelCatalystPresets.map((c) => c.key));
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
              {"\u65C5\u306E\u7D20\u6750\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"} &rarr;
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
                  const catalystLabel =
                    travelCatalystPresets.find((c) => c.key === key)?.label ?? key;
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
