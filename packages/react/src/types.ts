/** API に送信する素材のワイヤーフォーマット */
export interface MaterialInput {
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
