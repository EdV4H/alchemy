import type { AlchemistConfig, Recipe, TransmutationOptions } from "@EdV4H/alchemy-core";

export class Alchemist {
  private config: AlchemistConfig;

  constructor(config: AlchemistConfig) {
    this.config = config;
  }

  async transmute<TInput, TOutput>(
    recipe: Recipe<TInput, TOutput>,
    material: TInput,
    options?: Omit<TransmutationOptions, "catalyst">,
  ): Promise<TOutput> {
    const prompt = await recipe.spell(material);

    const formatInstructions = recipe.refiner.getFormatInstructions?.();
    const fullPrompt = formatInstructions ? `${prompt}\n\n${formatInstructions}` : prompt;

    const result = await this.config.transmuter.transmute(fullPrompt, {
      catalyst: recipe.catalyst,
      ...options,
    });

    return recipe.refiner.refine(result.text);
  }

  async *stream<TInput>(
    recipe: Recipe<TInput, string>,
    material: TInput,
    options?: Omit<TransmutationOptions, "catalyst">,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.config.transmuter.stream) {
      throw new Error(
        "The configured Transmuter does not support streaming. " +
          "Implement the stream() method on your Transmuter.",
      );
    }

    const prompt = await recipe.spell(material);

    yield* this.config.transmuter.stream(prompt, {
      catalyst: recipe.catalyst,
      ...options,
    });
  }
}

// Re-export core types and refiners
export type * from "@EdV4H/alchemy-core";
export { JsonRefiner, TextRefiner } from "@EdV4H/alchemy-core";
export type { OpenAITransmuterConfig } from "./transmuters/openai.js";
// Re-export transmuters
export { OpenAITransmuter } from "./transmuters/openai.js";
