import type {
  MaterialPart,
  TransmutationOptions,
  TransmutationResult,
  Transmuter,
} from "@EdV4H/alchemy-core";
import { extractText, isTextOnly } from "@EdV4H/alchemy-core";
import OpenAI from "openai";

export interface OpenAITransmuterConfig {
  apiKey?: string;
  defaultModel?: string;
  baseURL?: string;
}

export class OpenAITransmuter implements Transmuter {
  private client: OpenAI;
  private defaultModel: string;

  constructor(config: OpenAITransmuterConfig = {}) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.defaultModel = config.defaultModel ?? "gpt-4o-mini";
  }

  async transmute(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): Promise<TransmutationResult> {
    const { catalyst, signal, language } = options;
    const model = catalyst?.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (catalyst?.roleDefinition) {
      messages.push({ role: "system", content: catalyst.roleDefinition });
    }
    if (language) {
      messages.push({ role: "system", content: `Respond in ${language}.` });
    }
    messages.push({ role: "user", content: this.toOpenAIContent(material) });

    const response = await this.client.chat.completions.create(
      {
        model,
        messages,
        temperature: catalyst?.temperature,
      },
      { signal },
    );

    const text = response.choices[0]?.message?.content ?? "";
    const usage = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined;

    return { text, usage };
  }

  async *stream(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown> {
    const { catalyst, signal, language } = options;
    const model = catalyst?.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (catalyst?.roleDefinition) {
      messages.push({ role: "system", content: catalyst.roleDefinition });
    }
    if (language) {
      messages.push({ role: "system", content: `Respond in ${language}.` });
    }
    messages.push({ role: "user", content: this.toOpenAIContent(material) });

    const stream = await this.client.chat.completions.create(
      {
        model,
        messages,
        temperature: catalyst?.temperature,
        stream: true,
      },
      { signal },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  private toOpenAIContent(parts: MaterialPart[]): string | OpenAI.Chat.ChatCompletionContentPart[] {
    if (isTextOnly(parts)) {
      return extractText(parts);
    }

    return parts.map((part): OpenAI.Chat.ChatCompletionContentPart => {
      switch (part.type) {
        case "text":
          return { type: "text", text: part.text };
        case "image": {
          const url =
            part.source.kind === "url"
              ? part.source.url
              : `data:${part.source.mediaType};base64,${part.source.data}`;
          return { type: "image_url", image_url: { url } };
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
            text: "[Video: not processed. Add videoToFrames() transform.]",
          };
        default:
          throw new Error(`Unsupported material part type: ${(part as MaterialPart).type}`);
      }
    });
  }
}
