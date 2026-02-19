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
  transmute(
    prompt: string,
    options: TransmutationOptions,
  ): Promise<TransmutationResult>;

  stream?(
    prompt: string,
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
  spell: (material: TInput) => string | Promise<string>;
  refiner: Refiner<TOutput>;
  tools?: ToolDefinition[];
}

// ──────────────────────────────────────────
// Alchemist (錬金術師): メインクライアント設定
// ──────────────────────────────────────────

export interface AlchemistConfig {
  transmuter: Transmuter;
}
