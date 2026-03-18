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

/** 素材パーツのタイプ文字列（拡張型も含む） */
export type MaterialPartType = MaterialPart["type"];

/** レシピが要求する素材タイプの定義 */
export interface MaterialRequirement {
  readonly type: MaterialPartType;
  readonly min?: number; // デフォルト: 1
  readonly max?: number; // undefined = 無制限
  readonly label?: string; // 表示用ラベル
  /** 該当typeの素材を受けて品質スコアを返す */
  readonly evaluate?: (parts: MaterialPart[]) => MaterialEvaluation | Promise<MaterialEvaluation>;
}

/** 個別素材の評価結果 */
export interface MaterialEvaluation {
  /** 0-1 の品質スコア */
  score: number;
  /** 評価メッセージ（例: "回答率が低いため精度が下がる可能性があります"） */
  message?: string;
}

/** judge に渡される素材評価の集約エントリ */
export interface MaterialEvaluationEntry {
  type: MaterialPartType;
  label?: string;
  evaluation: MaterialEvaluation;
}

/** judge の判定結果 */
export interface MaterialJudgement {
  canTransmute: boolean;
  /** canTransmute=true でも警告を出せる */
  warning?: string;
  /** canTransmute=false の理由 */
  message?: string;
}

/** バリデーション結果 */
export interface MaterialValidationResult {
  valid: boolean;
  message?: string;
  issues?: MaterialValidationIssue[];
  /** 各素材の品質スコア */
  evaluations?: MaterialEvaluationEntry[];
  /** 錬成可否判定 */
  judgement?: MaterialJudgement;
}

export interface MaterialValidationIssue {
  type: MaterialPartType;
  label?: string;
  requirement: { min: number; max?: number };
  actual: number;
  kind: "too_few" | "too_many";
}

export type SpellOutput = string | MaterialPart | MaterialPart[];

// ──────────────────────────────────────────
// MaterialTransform (素材変換): パイプライン
// ──────────────────────────────────────────

export interface MaterialTransformContext {
  readonly roleDefinition?: string;
  readonly temperature?: number;
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
  roleDefinition?: string;
  temperature?: number;
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
// Recipe (レシピ): 錬成の完全な定義
// ──────────────────────────────────────────

export interface Recipe<TInput, TOutput> {
  id: string;
  name?: string;
  roleDefinition?: string;
  temperature?: number;
  spell: (material: TInput) => SpellOutput | Promise<SpellOutput>;
  refiner: Refiner<TOutput>;
  transforms?: MaterialTransform[];
  requiredMaterials?: MaterialRequirement[];
  validateMaterials?: (
    parts: MaterialPart[],
  ) => MaterialValidationResult | Promise<MaterialValidationResult>;
  /** 全素材の評価結果を見て錬成可否を判断 */
  judgeMaterials?: (evaluations: MaterialEvaluationEntry[]) => MaterialJudgement;
}

// ──────────────────────────────────────────
// Alchemist (錬金術師): メインクライアント設定
// ──────────────────────────────────────────

export interface AlchemistConfig {
  transmuter: Transmuter;
  transforms?: MaterialTransform[];
  /** true にすると transmute() の先頭で素材バリデーションを自動実行 */
  validateMaterials?: boolean;
}
