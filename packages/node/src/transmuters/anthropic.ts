import type {
  MaterialPart,
  TransmutationOptions,
  TransmutationResult,
  Transmuter,
} from "@EdV4H/alchemy-core";
import { extractText, isTextOnly, TransmuteError } from "@EdV4H/alchemy-core";
import Anthropic from "@anthropic-ai/sdk";

export interface AnthropicTransmuterConfig {
  apiKey?: string;
  defaultModel?: string;
}

export class AnthropicTransmuter implements Transmuter {
  private client: Anthropic;
  private defaultModel: string;

  constructor(config: AnthropicTransmuterConfig = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.defaultModel = config.defaultModel ?? "claude-sonnet-4-20250514";
  }

  async transmute(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): Promise<TransmutationResult> {
    const { catalyst, signal } = options;
    const model = catalyst?.model ?? this.defaultModel;
    const system = this.buildSystem(options);
    const content = this.toAnthropicContent(material);

    const response = await this.client.messages.create(
      {
        model,
        max_tokens: 4096,
        system: system || undefined,
        messages: [{ role: "user", content }],
        temperature: catalyst?.temperature,
      },
      { signal: signal ?? undefined },
    );

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    const usage = response.usage
      ? {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        }
      : undefined;

    return { text, usage };
  }

  async *stream(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown> {
    const { catalyst, signal } = options;
    const model = catalyst?.model ?? this.defaultModel;
    const system = this.buildSystem(options);
    const content = this.toAnthropicContent(material);

    const stream = this.client.messages.stream(
      {
        model,
        max_tokens: 4096,
        system: system || undefined,
        messages: [{ role: "user", content }],
        temperature: catalyst?.temperature,
      },
      { signal: signal ?? undefined },
    );

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }

  private buildSystem(options: TransmutationOptions): string {
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

  private toAnthropicContent(
    parts: MaterialPart[],
  ): string | Anthropic.MessageCreateParams["messages"][0]["content"] {
    if (isTextOnly(parts)) {
      return extractText(parts);
    }

    return parts.map((part): Anthropic.ContentBlockParam => {
      switch (part.type) {
        case "text":
          return { type: "text", text: part.text };
        case "image": {
          if (part.source.kind === "base64") {
            return {
              type: "image",
              source: {
                type: "base64",
                media_type: part.source.mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: part.source.data,
              },
            };
          }
          return {
            type: "image",
            source: {
              type: "url",
              url: part.source.url,
            },
          };
        }
        case "document":
          return {
            type: "text",
            text: part.source.kind === "text" ? part.source.text : `[Document: ${part.source.url}]`,
          };
        case "data":
          return {
            type: "text",
            text: part.label
              ? `[${part.label}] (${part.format})\n${part.content}`
              : `(${part.format})\n${part.content}`,
          };
        case "audio":
          return {
            type: "text",
            text: "[Audio: not transcribed. Add audioToText() transform.]",
          };
        case "video":
          return {
            type: "text",
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
