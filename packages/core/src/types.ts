import type { z } from "zod";

// ──────────────────────────────────────────
// Catalyst (触媒): モデル設定・システムプロンプト
// ──────────────────────────────────────────

export interface CatalystConfig {
  roleDefinition?: string;
  temperature?: number;
  model?: string;
}

export interface NamedCatalyst {
  readonly key: string;
  readonly label: string;
  readonly config: CatalystConfig;
  readonly isDefault?: boolean;
}

// ──────────────────────────────────────────
// Material (素材): LLM入力のコンテンツパーツ
// ──────────────────────────────────────────

export interface TextMaterialPart {
  readonly type: "text";
  readonly text: string;
}

export interface ImageMaterialPart {
  readonly type: "image";
  readonly source:
    | { readonly kind: "url"; readonly url: string }
    | { readonly kind: "base64"; readonly mediaType: string; readonly data: string };
}

export interface AudioMaterialPart {
  readonly type: "audio";
  readonly source:
    | { readonly kind: "url"; readonly url: string }
    | { readonly kind: "base64"; readonly mediaType: string; readonly data: string };
}

export interface DocumentMaterialPart {
  readonly type: "document";
  readonly source:
    | { readonly kind: "url"; readonly url: string }
    | { readonly kind: "text"; readonly text: string; readonly metadata?: Record<string, string> };
}

export interface VideoMaterialPart {
  readonly type: "video";
  readonly source:
    | { readonly kind: "url"; readonly url: string }
    | { readonly kind: "base64"; readonly mediaType: string; readonly data: string };
}

export interface DataMaterialPart {
  readonly type: "data";
  readonly format: "csv" | "json" | "tsv";
  readonly content: string;
  readonly label?: string;
}

export type BuiltinMaterialPart =
  | TextMaterialPart
  | ImageMaterialPart
  | AudioMaterialPart
  | DocumentMaterialPart
  | VideoMaterialPart
  | DataMaterialPart;

/** Declaration merging で拡張可能 */
// biome-ignore lint/suspicious/noEmptyInterface: declaration merging point
export interface MaterialPartRegistry {}

export type MaterialPart = BuiltinMaterialPart | MaterialPartRegistry[keyof MaterialPartRegistry];

export type SpellOutput = string | MaterialPart | MaterialPart[];

// ──────────────────────────────────────────
// MaterialTransform (素材変換): パイプライン
// ──────────────────────────────────────────

export interface MaterialTransformContext {
  readonly catalyst?: CatalystConfig;
  readonly recipeId: string;
}

export type MaterialTransform = (
  parts: MaterialPart[],
  context: MaterialTransformContext,
) => MaterialPart[] | Promise<MaterialPart[]>;

// ──────────────────────────────────────────
// Transmuter (錬成炉): LLMプロバイダアダプタ
// ──────────────────────────────────────────

export type KnownLanguage =
  | "English"
  | "Japanese"
  | "Chinese"
  | "Korean"
  | "Spanish"
  | "French"
  | "German"
  | "Portuguese"
  | "Italian"
  | "Russian"
  | "Arabic"
  | "Hindi";

export type Language = KnownLanguage | (string & {});

export interface TransmutationOptions {
  catalyst?: CatalystConfig;
  signal?: AbortSignal;
  language?: Language;
}

export interface TransmutationResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Transmuter {
  transmute(material: MaterialPart[], options: TransmutationOptions): Promise<TransmutationResult>;

  stream?(
    material: MaterialPart[],
    options: TransmutationOptions,
  ): AsyncGenerator<string, void, unknown>;
}

// ──────────────────────────────────────────
// Refiner (精製器): 出力パーサー
// ──────────────────────────────────────────

export interface Refiner<TOutput> {
  refine(rawText: string): TOutput | Promise<TOutput>;
  getFormatInstructions?(): string;
}

// ──────────────────────────────────────────
// Tool (将来のエージェント拡張用)
// ──────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (params: unknown) => Promise<unknown>;
}

// ──────────────────────────────────────────
// Recipe (レシピ): 錬成の完全な定義
// ──────────────────────────────────────────

export interface Recipe<TInput, TOutput> {
  id: string;
  name?: string;
  catalyst?: CatalystConfig;
  spell: (material: TInput) => SpellOutput | Promise<SpellOutput>;
  refiner: Refiner<TOutput>;
  tools?: ToolDefinition[];
  transforms?: MaterialTransform[];
}

// ──────────────────────────────────────────
// Alchemist (錬金術師): メインクライアント設定
// ──────────────────────────────────────────

export interface AlchemistConfig {
  transmuter: Transmuter;
  transforms?: MaterialTransform[];
}
