import type { MaterialPart } from "./types.js";

/** API に送信する素材のワイヤーフォーマット (discriminated union) */
export type MaterialInput =
  | { type: "text"; text: string }
  | { type: "image"; imageUrl: string }
  | { type: "audio"; audioUrl: string }
  | { type: "document"; documentText?: string }
  | { type: "video"; videoUrl: string }
  | {
      type: "data";
      dataFormat: "csv" | "json" | "tsv";
      dataContent: string;
      dataLabel?: string;
    };

/** MaterialInput[] を MaterialPart[] に変換する */
export function toMaterialParts(materials: MaterialInput[]): MaterialPart[] {
  return materials.flatMap((m): MaterialPart[] => {
    switch (m.type) {
      case "text":
        return [{ type: "text", text: m.text }];
      case "image":
        return [{ type: "image", source: { kind: "url", url: m.imageUrl } }];
      case "audio":
        return [{ type: "audio", source: { kind: "url", url: m.audioUrl } }];
      case "document":
        if (m.documentText) {
          return [{ type: "document", source: { kind: "text", text: m.documentText } }];
        }
        return [];
      case "video":
        return [{ type: "video", source: { kind: "url", url: m.videoUrl } }];
      case "data":
        return [{ type: "data", format: m.dataFormat, content: m.dataContent, label: m.dataLabel }];
      default:
        return [];
    }
  });
}
