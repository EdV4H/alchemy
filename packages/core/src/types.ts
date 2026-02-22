import type { z } from "zod";

// ──────────────────────────────────────────
// Catalyst (触媒): モデル設定・システムプロンプト
// ──────────────────────────────────────────

export interface CatalystConfig {
  roleDefinition?: string;
  temperature?: number;
  model?: string;
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

export type BuiltinMaterialPart = TextMaterialPart | ImageMaterialPart;

/** Declaration merging で拡張可能 */
// biome-ignore lint/suspicious/noEmptyInterface: declaration merging point
export interface MaterialPartRegistry {}

export type MaterialPart = BuiltinMaterialPart | MaterialPartRegistry[keyof MaterialPartRegistry];

export type SpellOutput = string | MaterialPart | MaterialPart[];

// ──────────────────────────────────────────
// Transmuter (錬成炉): LLMプロバイダアダプタ
// ──────────────────────────────────────────

export interface TransmutationOptions {
  catalyst?: CatalystConfig;
  signal?: AbortSignal;
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
}

// ──────────────────────────────────────────
// Alchemist (錬金術師): メインクライアント設定
// ──────────────────────────────────────────

export interface AlchemistConfig {
  transmuter: Transmuter;
}
