export type { MaterialInput } from "@EdV4H/alchemy-react";

export interface MaterialCard {
  id: string;
  icon: string;
  label: string;
  category: "text" | "code" | "image" | "audio" | "video" | "data" | "document";
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  documentText?: string;
}

export interface CustomMaterial {
  id: string;
  label: string;
  type: "text" | "image" | "audio" | "video" | "data" | "document";
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  dataFormat?: "csv" | "json" | "tsv";
  dataContent?: string;
  documentText?: string;
}
