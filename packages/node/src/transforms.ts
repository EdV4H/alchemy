import type { MaterialPart, MaterialTransform } from "@EdV4H/alchemy-core";

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
          throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
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
