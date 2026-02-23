/** API に送信する素材のワイヤーフォーマット (discriminated union) */
export type MaterialInput =
  | { type: "text"; text: string }
  | { type: "image"; imageUrl: string }
  | { type: "audio"; audioUrl: string }
  | { type: "document"; documentText?: string }
  | { type: "video"; videoUrl: string }
  | { type: "data"; dataFormat: "csv" | "json" | "tsv"; dataContent: string; dataLabel?: string };
