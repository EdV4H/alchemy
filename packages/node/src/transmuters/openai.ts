import OpenAI from "openai";
import type {
  Transmuter,
  TransmutationOptions,
  TransmutationResult,
} from "@EdV4H/alchemy-core";

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
    prompt: string,
    options: TransmutationOptions,
  ): Promise<TransmutationResult> {
    const { catalyst, signal } = options;
    const model = catalyst?.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (catalyst?.roleDefinition) {
      messages.push({ role: "system", content: catalyst.roleDefinition });
    }
    messages.push({ role: "user", content: prompt });

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
    prompt: string,
    options: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown> {
    const { catalyst, signal } = options;
    const model = catalyst?.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (catalyst?.roleDefinition) {
      messages.push({ role: "system", content: catalyst.roleDefinition });
    }
    messages.push({ role: "user", content: prompt });

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
}
