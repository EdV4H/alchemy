import type {
  AlchemistConfig,
  MaterialPart,
  MaterialTransform,
  MaterialTransformContext,
  Recipe,
  TransmutationOptions,
} from "@EdV4H/alchemy-core";
import { normalizeSpellOutput } from "@EdV4H/alchemy-core";

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
    const spellOutput = await recipe.spell(material);
    let parts = normalizeSpellOutput(spellOutput);

    const transforms = this.collectTransforms(recipe);
    if (transforms.length > 0) {
      parts = await this.applyTransforms(
        parts,
        {
          catalyst: recipe.catalyst,
          recipeId: recipe.id,
        },
        transforms,
      );
    }

    const formatInstructions = recipe.refiner.getFormatInstructions?.();
    if (formatInstructions) {
      parts.push({ type: "text", text: formatInstructions });
    }

    const result = await this.config.transmuter.transmute(parts, {
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

    const spellOutput = await recipe.spell(material);
    let parts = normalizeSpellOutput(spellOutput);

    const transforms = this.collectTransforms(recipe);
    if (transforms.length > 0) {
      parts = await this.applyTransforms(
        parts,
        {
          catalyst: recipe.catalyst,
          recipeId: recipe.id,
        },
        transforms,
      );
    }

    yield* this.config.transmuter.stream(parts, {
      catalyst: recipe.catalyst,
      ...options,
    });
  }

  private collectTransforms<TInput, TOutput>(recipe: Recipe<TInput, TOutput>): MaterialTransform[] {
    const global = this.config.transforms ?? [];
    const local = recipe.transforms ?? [];
    return [...global, ...local];
  }

  private async applyTransforms(
    parts: MaterialPart[],
    context: MaterialTransformContext,
    transforms: MaterialTransform[],
  ): Promise<MaterialPart[]> {
    let current = parts;
    for (const transform of transforms) {
      current = await transform(current, context);
    }
    return current;
  }
}

// Re-export core types and refiners
export type * from "@EdV4H/alchemy-core";
export {
  extractText,
  filterByType,
  isTextOnly,
  JsonRefiner,
  normalizeSpellOutput,
  prependText,
  TextRefiner,
  truncateText,
} from "@EdV4H/alchemy-core";
// Node-specific transforms
export { imageUrlToBase64 } from "./transforms.js";
export type { OpenAITransmuterConfig } from "./transmuters/openai.js";
// Re-export transmuters
export { OpenAITransmuter } from "./transmuters/openai.js";
