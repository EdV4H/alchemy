import type {
  AlchemistConfig,
  MaterialPart,
  MaterialTransform,
  MaterialTransformContext,
  Recipe,
  TransmutationOptions,
} from "@edv4h/alchemy-core";
import {
  MaterialValidationError,
  normalizeSpellOutput,
  runMaterialValidation,
  TransmuteError,
} from "@edv4h/alchemy-core";

export class Alchemist {
  private config: AlchemistConfig;

  constructor(config: AlchemistConfig) {
    this.config = config;
  }

  async transmute<TInput, TOutput>(
    recipe: Recipe<TInput, TOutput>,
    material: TInput,
    options?: TransmutationOptions,
  ): Promise<TOutput> {
    const roleDefinition = options?.roleDefinition ?? recipe.roleDefinition;
    const temperature = options?.temperature ?? recipe.temperature;

    const spellOutput = await recipe.spell(material);
    let parts = normalizeSpellOutput(spellOutput);

    if (this.config.validateMaterials) {
      await this.autoValidate(recipe, parts);
    }

    const transforms = this.collectTransforms(recipe);
    if (transforms.length > 0) {
      parts = await this.applyTransforms(
        parts,
        { roleDefinition, temperature, recipeId: recipe.id },
        transforms,
      );
    }

    const formatInstructions = recipe.refiner.getFormatInstructions?.();
    if (formatInstructions) {
      parts.push({ type: "text", text: formatInstructions });
    }

    const result = await this.config.transmuter.transmute(parts, {
      roleDefinition,
      temperature,
      signal: options?.signal,
      language: options?.language,
    });

    return recipe.refiner.refine(result.text);
  }

  async *stream<TInput>(
    recipe: Recipe<TInput, string>,
    material: TInput,
    options?: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.config.transmuter.stream) {
      throw new TransmuteError(
        "The configured Transmuter does not support streaming. " +
          "Implement the stream() method on your Transmuter.",
      );
    }

    const roleDefinition = options?.roleDefinition ?? recipe.roleDefinition;
    const temperature = options?.temperature ?? recipe.temperature;

    const spellOutput = await recipe.spell(material);
    let parts = normalizeSpellOutput(spellOutput);

    if (this.config.validateMaterials) {
      await this.autoValidate(recipe, parts);
    }

    const transforms = this.collectTransforms(recipe);
    if (transforms.length > 0) {
      parts = await this.applyTransforms(
        parts,
        { roleDefinition, temperature, recipeId: recipe.id },
        transforms,
      );
    }

    yield* this.config.transmuter.stream(parts, {
      roleDefinition,
      temperature,
      signal: options?.signal,
      language: options?.language,
    });
  }

  async generate<TInput, TOutput>(
    recipe: Recipe<TInput, TOutput>,
    material: TInput,
    count: number,
    options?: TransmutationOptions,
  ): Promise<Record<string, TOutput | { error: Error }>> {
    if (count < 1) {
      throw new Error("count must be at least 1");
    }
    const indices = Array.from({ length: count }, (_, i) => i + 1);
    const settled = await Promise.allSettled(
      indices.map(() => this.transmute(recipe, material, options)),
    );
    return Object.fromEntries(
      indices.map((n, i) => {
        const r = settled[i];
        return [
          `variation-${n}`,
          r.status === "fulfilled"
            ? r.value
            : { error: r.reason instanceof Error ? r.reason : new Error(String(r.reason)) },
        ];
      }),
    );
  }

  private collectTransforms<TInput, TOutput>(recipe: Recipe<TInput, TOutput>): MaterialTransform[] {
    const global = this.config.transforms ?? [];
    const local = recipe.transforms ?? [];
    return [...global, ...local];
  }

  private async autoValidate<TInput, TOutput>(
    recipe: Recipe<TInput, TOutput>,
    parts: MaterialPart[],
  ): Promise<void> {
    const result = await runMaterialValidation(recipe, parts);
    if (!result.valid) {
      throw new MaterialValidationError(result);
    }
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
export type * from "@edv4h/alchemy-core";
export {
  AlchemyError,
  dataToText,
  extractAllText,
  extractText,
  filterByType,
  isTextOnly,
  JsonRefiner,
  MaterialValidationError,
  MermaidRefiner,
  normalizeSpellOutput,
  prependText,
  RefineError,
  runMaterialValidation,
  TextRefiner,
  TransformError,
  TransmuteError,
  toMaterialParts,
  truncateText,
  validateMaterialRequirements,
} from "@edv4h/alchemy-core";
