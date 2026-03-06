import type {
  MaterialPart,
  TransmutationOptions,
  TransmutationResult,
  Transmuter,
} from "@edv4h/alchemy-core";
import { extractText, isTextOnly, TransmuteError } from "@edv4h/alchemy-core";
import type { Content, Part } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GoogleTransmuterConfig {
  apiKey?: string;
  defaultModel?: string;
}

export class GoogleTransmuter implements Transmuter {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(config: GoogleTransmuterConfig = {}) {
    const apiKey = config.apiKey ?? process.env.GOOGLE_API_KEY ?? "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = config.defaultModel ?? "gemini-2.0-flash";
  }

  async transmute(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): Promise<TransmutationResult> {
    const { catalyst } = options;
    const modelName = catalyst?.model ?? this.defaultModel;
    const systemInstruction = this.buildSystemInstruction(options);
    const contents = this.toGoogleContents(material);

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction || undefined,
      generationConfig: {
        temperature: catalyst?.temperature,
      },
    });

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    const usageMetadata = response.usageMetadata;
    const usage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount ?? 0,
          completionTokens: usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: usageMetadata.totalTokenCount ?? 0,
        }
      : undefined;

    return { text, usage };
  }

  async *stream(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown> {
    const { catalyst } = options;
    const modelName = catalyst?.model ?? this.defaultModel;
    const systemInstruction = this.buildSystemInstruction(options);
    const contents = this.toGoogleContents(material);

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction || undefined,
      generationConfig: {
        temperature: catalyst?.temperature,
      },
    });

    const result = await model.generateContentStream({ contents });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  private buildSystemInstruction(options: TransmutationOptions): string {
    const { catalyst, language } = options;
    const parts: string[] = [];
    if (catalyst?.roleDefinition) {
      parts.push(catalyst.roleDefinition);
    }
    if (language) {
      parts.push(`Respond in ${language}.`);
    }
    return parts.join("\n");
  }

  private toGoogleContents(material: MaterialPart[]): Content[] {
    const parts = this.toGoogleParts(material);
    return [{ role: "user", parts }];
  }

  private toGoogleParts(material: MaterialPart[]): Part[] {
    if (isTextOnly(material)) {
      return [{ text: extractText(material) }];
    }

    return material.map((part): Part => {
      switch (part.type) {
        case "text":
          return { text: part.text };
        case "image": {
          if (part.source.kind === "base64") {
            return {
              inlineData: {
                mimeType: part.source.mediaType,
                data: part.source.data,
              },
            };
          }
          return {
            text: `[Image URL: ${part.source.url}] (Use imageUrlToBase64() transform for inline image support)`,
          };
        }
        case "document":
          return {
            text: part.source.kind === "text" ? part.source.text : `[Document: ${part.source.url}]`,
          };
        case "data":
          return {
            text: part.label
              ? `[${part.label}] (${part.format})\n${part.content}`
              : `(${part.format})\n${part.content}`,
          };
        case "audio":
          return {
            text: "[Audio: not transcribed. Add audioToText() transform.]",
          };
        case "video":
          return {
            text: `[Video (${part.source.kind}): not processed. Add videoToFrames() transform.]`,
          };
        default:
          throw new TransmuteError(
            `Unsupported material part type: ${(part as MaterialPart).type}`,
          );
      }
    });
  }
}
