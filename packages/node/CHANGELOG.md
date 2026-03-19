# @edv4h/alchemy-node

## 1.0.0

### Major Changes

- a6ef47b: Remove Catalyst concept — flatten roleDefinition and temperature into Recipe and TransmutationOptions

  BREAKING CHANGES:

  - Removed `CatalystConfig` and `NamedCatalyst` types from core
  - Removed `resolveCatalyst()` utility from core
  - Removed `catalyst.ts` module from core
  - `Recipe` now has direct `roleDefinition?: string` and `temperature?: number` fields instead of `catalyst?: CatalystConfig`
  - `TransmutationOptions` now has flat `roleDefinition` and `temperature` instead of nested `catalyst`
  - `MaterialTransformContext` now has flat `roleDefinition` and `temperature` instead of nested `catalyst`
  - Removed `compare()` method from `Alchemist`
  - Removed `useCompare` hook from react package
  - Removed `selectCatalyst`, `selectedCatalystKey`, `compareMode`, `compareResults` from `useAlchemy`
  - Removed `catalystKey` parameter from `useTransmute` and `useGenerate`
  - Transmuter plugins no longer accept per-request model override via catalyst; use `defaultModel` in constructor

### Minor Changes

- 1a81407: Add multi-variation generation feature: `Alchemist.generate()` runs the same recipe N times in parallel and returns `Record<string, TOutput | { error: Error }>`. Includes `useGenerate` hook and `useAlchemy` generate mode integration for React (per-variation results typed as `TOutput | { error: string }`), with ModeSelector/GenerateCountStepper/VariationResultsGrid UI components.
- 4f54990: Add material evaluation system for graded quality scoring

  - New types: `MaterialEvaluation`, `MaterialEvaluationEntry`, `MaterialJudgement`
  - `MaterialRequirement.evaluate` — per-material quality scoring (0-1)
  - `Recipe.judgeMaterials` — aggregate evaluation to determine transmute eligibility
  - `MaterialValidationResult` extended with `evaluations` and `judgement`
  - `MaterialValidationError` error class with full result details
  - `AlchemistConfig.validateMaterials` — auto-validate in transmute()/stream()
  - **Breaking**: `runMaterialValidation` is now async (returns `Promise<MaterialValidationResult>`)

- f6eda47: Add MermaidRefiner for validating Mermaid diagram output with code fence stripping and diagram keyword checking. Add mermaid output type support to hono-app Playground, Travel, and Team LP pages.
- f88ca76: Make LLM SDK dependencies optional by removing plugin re-exports from alchemy-node. Users now import transmuters and transforms directly from their respective plugin packages.
- 736731a: Extract Transmuter and Node Transform into independent plugin packages

  - `@edv4h/alchemy-plugin-transmuter-anthropic`: Anthropic (Claude) transmuter
  - `@edv4h/alchemy-plugin-transmuter-openai`: OpenAI transmuter
  - `@edv4h/alchemy-plugin-transmuter-google`: Google (Gemini) transmuter
  - `@edv4h/alchemy-plugin-transforms-node`: Node.js material transforms (imageUrlToBase64, documentToText, audioToText, videoToFrames)

  `@edv4h/alchemy-node` is now a facade that re-exports from the plugin packages, maintaining full backward compatibility.

- eb2ad1a: Add material validation system with declarative requirements and custom validators

  - New types: `MaterialPartType`, `MaterialRequirement`, `MaterialValidationResult`, `MaterialValidationIssue`
  - New functions: `validateMaterialRequirements()`, `runMaterialValidation()`
  - Recipe interface extended with optional `requiredMaterials` and `validateMaterials` fields

### Patch Changes

- e6b0aaa: Move LLM SDK dependencies to peerDependencies in transmuter plugins, update alchemy-node description, fix docs-site import paths, and add README files for all packages
- Updated dependencies [4f54990]
- Updated dependencies [f6eda47]
- Updated dependencies [a6ef47b]
- Updated dependencies [eb2ad1a]
  - @edv4h/alchemy-core@1.0.0

## 0.1.0

### Minor Changes

- 6d0601a: Type safety improvements: MaterialInput discriminated union, generic useAlchemy<TOutput>, custom error hierarchy, Language type hints. Alchemist.compare() now uses Promise.allSettled for partial failure resilience. TextRefiner adds getFormatInstructions(). VideoMaterialPart gains base64 support. Stub transforms throw by default. Remove unused ToolDefinition. Extract toMaterialParts() to core. Deduplicate Zod helpers in demo app.

### Patch Changes

- ecd52a9: Add headless React hooks (useTransmute, useCompare, useAlchemy) for client-side transmutation workflows. Extract buildMessages() in OpenAITransmuter to deduplicate transmute/stream methods.
- Updated dependencies [6d0601a]
  - @edv4h/alchemy-core@0.1.0
