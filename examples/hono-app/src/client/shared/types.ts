export type { MaterialInput } from "@edv4h/alchemy-react";

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

export type CustomMaterialType = "text" | "image" | "data" | "document" | "audio" | "video";

export const CUSTOM_TYPE_LABELS: Record<CustomMaterialType, string> = {
  text: "+ Text",
  image: "+ Image",
  data: "+ Data",
  document: "+ Doc",
  audio: "+ Audio",
  video: "+ Video",
};

export function customMaterialIcon(type: CustomMaterial["type"]): string {
  switch (type) {
    case "data":
      return "\uD83D\uDCCA";
    case "document":
      return "\uD83D\uDCC4";
    case "audio":
      return "\uD83C\uDFA7";
    case "video":
      return "\uD83C\uDFAC";
    case "image":
      return "\uD83D\uDDBC\uFE0F";
    default:
      return "\uD83D\uDCDD";
  }
}
