import type { MaterialPart, MaterialValidationResult } from "@edv4h/alchemy-node";

export const AVAILABLE_TRANSFORMS: { value: string; desc: string }[] = [
  { value: "truncateText(4000)", desc: "テキストを4000文字に切り詰め" },
  { value: "truncateText(2000)", desc: "テキストを2000文字に切り詰め" },
  { value: "truncateText(8000)", desc: "テキストを8000文字に切り詰め" },
  { value: 'filterByType("text")', desc: "テキスト素材だけ残す" },
  { value: 'filterByType("image")', desc: "画像素材だけ残す" },
  { value: 'filterByType("data")', desc: "データ素材だけ残す" },
  { value: 'prependText("")', desc: "先頭にテキストを追加" },
  { value: "dataToText()", desc: "CSV/JSONデータをテキストに変換" },
  { value: "documentToText()", desc: "ドキュメントをテキストに変換" },
  { value: "imageUrlToBase64()", desc: "画像URLをBase64に変換" },
];

export const RECIPE_ICONS = ["📝", "📋", "🧪", "🔬", "⚗️", "✨", "🎯", "💡", "🔮", "📐", "🛠️", "🧩"];

// ─── Sample Material Validators ──────────────────────────────────────────────

export interface SampleValidator {
  key: string;
  label: string;
  desc: string;
  validate: (parts: MaterialPart[]) => MaterialValidationResult;
}

export const SAMPLE_VALIDATORS: SampleValidator[] = [
  {
    key: "text-min-10",
    label: "Text >= 10 chars",
    desc: "テキストが合計10文字以上であること",
    validate: (parts) => {
      const total = parts
        .filter((p) => p.type === "text")
        .reduce((sum, p) => sum + ("text" in p ? p.text.length : 0), 0);
      if (total < 10) {
        return { valid: false, message: `Text must be at least 10 characters (got ${total})` };
      }
      return { valid: true };
    },
  },
  {
    key: "text-min-50",
    label: "Text >= 50 chars",
    desc: "テキストが合計50文字以上であること",
    validate: (parts) => {
      const total = parts
        .filter((p) => p.type === "text")
        .reduce((sum, p) => sum + ("text" in p ? p.text.length : 0), 0);
      if (total < 50) {
        return { valid: false, message: `Text must be at least 50 characters (got ${total})` };
      }
      return { valid: true };
    },
  },
  {
    key: "text-max-500",
    label: "Text <= 500 chars",
    desc: "テキストが合計500文字以内であること",
    validate: (parts) => {
      const total = parts
        .filter((p) => p.type === "text")
        .reduce((sum, p) => sum + ("text" in p ? p.text.length : 0), 0);
      if (total > 500) {
        return { valid: false, message: `Text must be at most 500 characters (got ${total})` };
      }
      return { valid: true };
    },
  },
  {
    key: "has-url",
    label: "Contains URL",
    desc: "テキストにURLが含まれていること",
    validate: (parts) => {
      const hasUrl = parts.some(
        (p) => p.type === "text" && "text" in p && /https?:\/\/\S+/.test(p.text),
      );
      if (!hasUrl) {
        return { valid: false, message: "Text must contain at least one URL" };
      }
      return { valid: true };
    },
  },
  {
    key: "has-json",
    label: "Valid JSON text",
    desc: "テキストが有効なJSONであること",
    validate: (parts) => {
      const textParts = parts.filter((p) => p.type === "text" && "text" in p);
      if (textParts.length === 0) {
        return { valid: false, message: "No text material found" };
      }
      for (const p of textParts) {
        if ("text" in p) {
          try {
            JSON.parse(p.text);
          } catch {
            return { valid: false, message: "Text is not valid JSON" };
          }
        }
      }
      return { valid: true };
    },
  },
  {
    key: "no-empty-text",
    label: "No empty text",
    desc: "テキスト素材が空でないこと",
    validate: (parts) => {
      const emptyText = parts.some((p) => p.type === "text" && "text" in p && p.text.trim() === "");
      if (emptyText) {
        return { valid: false, message: "Text materials must not be empty" };
      }
      return { valid: true };
    },
  },
];

export function findSampleValidator(key: string): SampleValidator | undefined {
  return SAMPLE_VALIDATORS.find((v) => v.key === key);
}
