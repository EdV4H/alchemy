import type {
  AlchemistConfig,
  Recipe,
  TransmutationOptions,
} from "@EdV4H/alchemy-core";

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
    const fullPrompt = formatInstructions
      ? `${prompt}\n\n${formatInstructions}`
      : prompt;

    const result = await this.config.transmuter.transmute(fullPrompt, {
      catalyst: recipe.catalyst,
      ...options,
    });

    return recipe.refiner.refine(result.text);
  }
}

// Re-export core types for convenience
export type * from "@EdV4H/alchemy-core";
