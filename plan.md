Alchemy AI Library 設計書 (TypeScript Edition)1. コンセプト定義「データの錬金術」雑多なデータ（原石）を、適切な指示（触媒）と処理（術式）を用いて、価値ある情報（金）へと昇華させる汎用LLMラッパーライブラリ。Philosopher's Stone (賢者の石): 究極の抽象化と自動化を目指す。Equivalent Exchange (等価交換): 入力（トークン・コスト）に見合う出力（価値）を保証する型安全性。2. 想定実行環境 (Runtime)本ライブラリは Isomorphic (Universal) 設計を採用し、以下の環境で動作することを想定する。環境推奨度用途・注意点Server (Node.js/Bun/Deno)⭐⭐⭐推奨。APIキーの安全な管理、長時間実行、ストリーミング制御に最適。Edge (Vercel/Cloudflare)⭐⭐軽量な錬成（短文生成など）に向く。タイムアウト制約に注意が必要。Browser (Client-side)⭐注意。APIキー露出リスクがあるため、WebLLM等のローカル実行や、社内ツール用途に限る。3. ドメイン用語定義 (Ubiquitous Language)用語英語名役割TypeScript型イメージ素材Material入力データ。型安全性を持つ。TInput (Generic)触媒Catalystモデル設定やシステムプロンプト。CatalystConfig術式Spellプロンプトテンプレートや関数定義。`stringレシピRecipe上記をまとめた定義ファイル。Recipe<TInput, TOutput>錬成炉TransmuterLLMプロバイダへの接続アダプタ。interface Transmuter精製器Refiner出力を解析・変換するパーサー。interface Refiner<TOutput>錬金術師Alchemistライブラリのメインクライアント。class Alchemist4. アーキテクチャ概要コアコンセプトは 「DI (Dependency Injection) による拡張性の確保」 です。4.1 クラス構成概念図classDiagram
    class Alchemist {
        +use(plugin)
        +transmute(recipe, material)
    }
    class Transmuter {
        <<interface>>
        +chat(messages)
        +stream(messages)
    }
    class Refiner {
        <<interface>>
        +refine(rawResponse)
    }
    class Recipe {
        +spell: string
        +catalyst: Catalyst
        +refiner: Refiner
    }

    Alchemist --> Transmuter : Uses
    Alchemist ..> Recipe : Executes
    Recipe --> Refiner : Defines Output
    Transmuter <|-- OpenAITransmuter
    Transmuter <|-- AnthropicTransmuter
    Transmuter <|-- CustomLLMTransmuter
5. パッケージ構成と型共有 (Package Strategy)フロントエンドとバックエンドで型定義を共有（Isomorphic）できるよう、ライブラリの責務を明確に分離します。個人スコープ(@EdV4H)を利用して公開します。5.1 モジュール分割イメージ@EdV4H/alchemy-core (Shared / Types)依存: 軽量なユーティリティのみ (Zodなど)。Node.js組み込みモジュール(fs, crypto)には依存しない。内容: Recipe インターフェース、型定義、Refiner のロジック。用途: フロントエンドでの型インポート、レシピ定義。@EdV4H/alchemy-node (Runtime)依存: @EdV4H/alchemy-core, OpenAI SDK, Node.js modules。内容: Alchemist クラスの実装、OpenAITransmuter などのAPIを叩く実装。用途: バックエンドでの実行。@EdV4H/alchemy-react (Headless UI)依存: @EdV4H/alchemy-core, React。内容: useTransmutation などのReact Hooks。用途: フロントエンドでの状態管理とAPI連携の抽象化。5.2 リポジトリ構成 (Directory Structure)Turborepo や pnpm workspaces を利用した Monorepo 構成を推奨します。alchemy/
├── package.json          // Root manifest (Workspaces config)
├── pnpm-workspace.yaml   // pnpm workspaces definition
├── turbo.json            // Turborepo config
├── packages/             // ライブラリ本体
│   ├── core/             // @EdV4H/alchemy-core
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── node/             // @EdV4H/alchemy-node
│   │   ├── src/
│   │   └── package.json
│   └── react/            // @EdV4H/alchemy-react
│       ├── src/
│       └── package.json
├── examples/             // 使用例・デモアプリ
│   ├── nextjs-app/       // Next.jsでの使用例 (App Router)
│   └── simple-script/    // Node.jsスクリプト例
└── tsconfig.base.json    // 共通TS設定
6. Development & Publishing Workflow内部パッケージの依存関係を解決しながら、効率的に開発・リリースを行うためのフロー定義です。6.1 Versioning Strategy (Changesets)Monorepo構成でのバージョン管理には Changesets を採用します。宣言的バージョン管理: 開発者はPR作成時に pnpm changeset を実行し、変更内容（Major/Minor/Patch）とコメントを記述します。依存関係の自動解決: core が更新された場合、それに依存する node や react のバージョンも自動的にバンプが必要か判定されます。CHANGELOG生成: リリース時に各パッケージの CHANGELOG.md が自動生成・追記されます。6.2 CI/CD Pipeline (GitHub Actions)人手を介さず、安全かつ継続的にパッケージを公開するパイプラインを構築します。Quality Gate (PR作成時)Lint (ESLint), Type Check (tsc), Test (Vitest) を全パッケージに対して並列実行。Build チェックを行い、循環参照やビルドエラーを未然に防ぐ。Release Preparation (mainマージ時)Changesetsのアクションが起動し、リリース待ちの変更がある場合は 「Version Packages」 というPRを自動作成/更新します。このPRにはバージョンバンプとCHANGELOGの更新が含まれます。Publishing (Version PRマージ時)「Version Packages」PRがマージされると、GitHub Actionsが以下を実行します。各パッケージのビルドnpm publish (Provenanceオプション付き)GitHub Releases の作成とタグ打ち (v1.0.0 etc.)6.3 Local Development Experience開発者がストレスなくコーディングできる環境を整備します。Interactive Watch Mode: turbo watch コマンドにより、変更があったパッケージと、それに依存するパッケージ（および examples アプリ）をインテリジェントに再ビルドします。Hot Reloading: examples/nextjs-app 等のデモアプリで、ライブラリコード(packages/*)の変更を即座に反映し、動作確認を行います。7. Core Interfaces (TypeScript)7.1 Recipe (レシピ定義)入力(TInput)と出力(TOutput)の型をGenericsで定義し、コンパイル時の型安全性を保証します。import { z } from 'zod';

// レシピの定義インターフェース
export interface Recipe<TInput, TOutput> {
  id: string;
  name?: string;
  
  // 触媒: システムプロンプトやモデル設定
  catalyst?: {
    roleDefinition?: string;
    temperature?: number;
    model?: string; // 特定モデル推奨がある場合
  };

  // 術式: プロンプト生成ロジック
  spell: (material: TInput) => string | Promise<string>;

  // 精製器: LLMの生の出力を TOutput に変換する
  refiner: Refiner<TOutput>;
  
  // エージェント拡張用 (将来実装)
  tools?: ToolDefinition[]; 
}
7.2 Transmuter (LLMアダプタ)LLMごとの差異（APIエンドポイント、認証、独自パラメータ）を吸収します。ブラウザ動作時は、ここを Fetch ベースの実装にすることで対応します。export interface Transmuter {
  transmute(
    prompt: string, 
    options: TransmutationOptions
  ): Promise<TransmutationResult>;
  
  // ストリーミング対応
  stream?(
    prompt: string, 
    options: TransmutationOptions
  ): AsyncGenerator<string>;
}

// 実装例
export class OpenAITransmuter implements Transmuter { ... }
export class GeminiTransmuter implements Transmuter { ... }
7.3 Refiner (出力パーサー)出力をどう扱うかを定義します。ここで構造化データのバリデーションも行います。export interface Refiner<T> {
  refine(rawText: string): T | Promise<T>;
  getFormatInstructions?(): string; // プロンプトに埋め込む指示文
}

// 標準提供するRefiner
export class JsonRefiner<T> implements Refiner<T> {
  constructor(private schema: z.ZodSchema<T>) {}
  // ... Zodを使ってパース＆バリデーション
}

export class TextRefiner implements Refiner<string> {
  // ... そのままテキストを返す
}
8. ユースケース実装例8.1 基本的な錬成 (テキスト要約)// 1. レシピの作成
const summaryRecipe: Recipe<string, string> = {
  id: 'simple-summary',
  spell: (text) => `Summarize this: ${text}`,
  refiner: new TextRefiner()
};

// 2. 錬金術師の召喚 (OpenAIを使用)
// Node.js環境を想定
const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter({ apiKey: process.env.OPENAI_API_KEY })
});

// 3. 錬成実行
const result = await alchemist.transmute(summaryRecipe, "Long article text...");
console.log(result); // string
8.2 高度な錬成 (構造化データ抽出)import { z } from 'zod';

// 出力スキーマ定義
const UserSchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
  level: z.enum(['Novice', 'Expert'])
});

// レシピ定義
const profileExtractionRecipe: Recipe<string, z.infer<typeof UserSchema>> = {
  id: 'extract-profile',
  catalyst: { roleDefinition: "Extract user info strictly." },
  spell: (resumeText) => `Parse this resume:\n${resumeText}`,
  
  // JSON Refinerを使うことで、出力は型付けされたオブジェクトになる
  refiner: new JsonRefiner(UserSchema)
};

// 錬成
const userProfile = await alchemist.transmute(profileExtractionRecipe, rawResume);
// userProfile.skills は string[] として型推論される
9. Frontend Headless Library (@EdV4H/alchemy-react)UIを持たない「Headless Hooks」を提供し、フロントエンドでの状態管理を自動化します。9.1 useTransmutation (単発錬成フック)レシピを渡すだけで、入力・送信・ローディング・エラー・結果の型安全な管理を提供します。import { useTransmutation } from '@EdV4H/alchemy-react';
import { analyzeBioRecipe } from '@/shared/recipes';

// エンドポイントはBFF(Backend for Frontend)を想定
const BioAnalyzer = () => {
  const { 
    mutate,       // 実行関数
    data,         // 結果 (型: OutputSchema)
    isLoading,    // ローディング中フラグ
    error         // エラー情報
  } = useTransmutation(analyzeBioRecipe, {
    endpoint: '/api/alchemy/transmute' 
  });

  if (data) {
    return (
      <div>
        <h3>{data.summary}</h3>
        <ul>{data.keywords.map(k => <li key={k}>{k}</li>)}</ul>
      </div>
    );
  }

  return (
    <button onClick={() => mutate({ bio: "I am a developer..." })} disabled={isLoading}>
      {isLoading ? "Transmuting..." : "Analyze"}
    </button>
  );
};
9.2 useChatSession (対話錬成フック)チャット履歴の管理、ストリーミング受信の結合などを隠蔽します。const { messages, sendMessage, isStreaming } = useChatSession(chatRecipe);

// sendMessage("Hello") を呼ぶだけで、履歴に追加→API送信→ストリーム受信→履歴更新まで全自動
10. 将来の拡張ロードマップ10.1 Agentic Alchemy (自律錬成)将来的に Recipe に tools 配列を持たせることで、AIが必要な素材を自ら調達したり、計算したりする自律型へ進化させます。ToolMaterial: 外部APIの結果を動的に素材として取り込む。LoopSpell: 条件が満たされるまで思考と行動を繰り返す術式。10.2 Middleware (錬成陣の付加効果)Alchemist クラスにミドルウェア層を追加し、機能をプラグインできるようにします。LoggerPlugin: プロンプトと結果を記録。CachePlugin: 同じ素材・術式の組み合わせならキャッシュを返す。CostLimiter: 予算オーバーを防ぐ安全装置。
