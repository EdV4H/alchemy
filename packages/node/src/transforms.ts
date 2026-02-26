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
        const bytes = new Uint8Array(await res.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const mediaType = res.headers.get("content-type") ?? "image/png";
        result.push({
          type: "image",
          source: { kind: "base64", mediaType, data: base64 },
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
 * 音声パーツをテキストに変換する
 * デフォルトでは未実装のため Error を throw する。
 * `{ stub: true }` で旧来のプレースホルダーテキスト挙動に切り替え可能。
 */
export function audioToText(options?: { stub?: boolean }): MaterialTransform {
  return async (parts) => {
    return parts.map((p) => {
      if (p.type !== "audio") return p;
      if (options?.stub) {
        return {
          type: "text" as const,
          text: "[Audio transcription not available]",
        };
      }
      throw new TransformError(
        "audioToText() requires OpenAI Whisper integration. Use { stub: true } to suppress.",
      );
    });
  };
}

/**
 * ビデオパーツを画像フレーム群に変換する
 * デフォルトでは未実装のため Error を throw する。
 * `{ stub: true }` で旧来のプレースホルダーテキスト挙動に切り替え可能。
 */
export function videoToFrames(options?: {
  frameCount?: number;
  stub?: boolean;
}): MaterialTransform {
  return async (parts) => {
    return parts.map((p) => {
      if (p.type !== "video") return p;
      if (options?.stub) {
        return {
          type: "text" as const,
          text: "[Video frame extraction not available]",
        };
      }
      throw new TransformError(
        "videoToFrames() requires ffmpeg integration. Use { stub: true } to suppress.",
      );
    });
  };
}
