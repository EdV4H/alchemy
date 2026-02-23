import type { MaterialPart, MaterialTransform } from "@EdV4H/alchemy-core";
import { TransformError } from "@EdV4H/alchemy-core";

/**
 * 画像 URL パーツを base64 に変換する
 */
export function imageUrlToBase64(): MaterialTransform {
  return async (parts) => {
    const result: MaterialPart[] = [];
    for (const part of parts) {
      if (part.type === "image" && part.source.kind === "url") {
        const res = await fetch(part.source.url);
        if (!res.ok) {
          throw new TransformError(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const mediaType = res.headers.get("content-type") ?? "image/png";
        result.push({
          type: "image",
          source: { kind: "base64", mediaType, data: buffer.toString("base64") },
        });
      } else {
        result.push(part);
      }
    }
    return result;
  };
}

/**
 * ドキュメントパーツをテキストに変換する
 * - text source: metadata 付きテキストパーツ化
 * - url source: fetch → テキスト抽出（plain text のみ、PDF 対応は後続 PR）
 */
export function documentToText(): MaterialTransform {
  return async (parts) => {
    const result: MaterialPart[] = [];
    for (const part of parts) {
      if (part.type === "document") {
        if (part.source.kind === "text") {
          const meta = part.source.metadata
            ? Object.entries(part.source.metadata)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")
            : "";
          const prefix = meta ? `[Document: ${meta}]\n` : "";
          result.push({ type: "text", text: `${prefix}${part.source.text}` });
        } else {
          const res = await fetch(part.source.url);
          if (!res.ok) {
            throw new TransformError(`Failed to fetch document: ${res.status} ${res.statusText}`);
          }
          result.push({ type: "text", text: await res.text() });
        }
      } else {
        result.push(part);
      }
    }
    return result;
  };
}

/**
 * 音声パーツをテキストに変換する（スタブ: Whisper 統合は後続 PR）
 */
export function audioToText(): MaterialTransform {
  return async (parts) => {
    return parts.map((p) => {
      if (p.type !== "audio") return p;
      return {
        type: "text" as const,
        text: "[Audio transcription not available — audioToText() requires OpenAI Whisper integration (coming soon)]",
      };
    });
  };
}

/**
 * ビデオパーツを画像フレーム群に変換する（スタブ: ffmpeg 統合は後続 PR）
 */
export function videoToFrames(_options?: { frameCount?: number }): MaterialTransform {
  return async (parts) => {
    return parts.map((p) => {
      if (p.type !== "video") return p;
      return {
        type: "text" as const,
        text: "[Video frame extraction not available — videoToFrames() requires ffmpeg (coming soon)]",
      };
    });
  };
}
