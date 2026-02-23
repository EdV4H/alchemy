import type { MaterialPart, MaterialTransform } from "./types.js";

/**
 * テキストパーツを最大長で切り詰める
 */
export function truncateText(maxLength: number, suffix = "…"): MaterialTransform {
  return (parts) =>
    parts.map((p) => {
      if (p.type !== "text" || p.text.length <= maxLength) return p;
      return { type: "text" as const, text: p.text.slice(0, maxLength) + suffix };
    });
}

/**
 * 先頭にテキストパーツを追加する
 */
export function prependText(text: string): MaterialTransform {
  return (parts) => [{ type: "text" as const, text }, ...parts];
}

/**
 * 指定タイプのパーツのみ残す
 */
export function filterByType(...types: MaterialPart["type"][]): MaterialTransform {
  return (parts) => parts.filter((p) => types.includes(p.type));
}
