# @edv4h/alchemy-core

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

- 4f54990: Add material evaluation system for graded quality scoring

  - New types: `MaterialEvaluation`, `MaterialEvaluationEntry`, `MaterialJudgement`
  - `MaterialRequirement.evaluate` — per-material quality scoring (0-1)
  - `Recipe.judgeMaterials` — aggregate evaluation to determine transmute eligibility
  - `MaterialValidationResult` extended with `evaluations` and `judgement`
  - `MaterialValidationError` error class with full result details
  - `AlchemistConfig.validateMaterials` — auto-validate in transmute()/stream()
  - **Breaking**: `runMaterialValidation` is now async (returns `Promise<MaterialValidationResult>`)

- f6eda47: Add MermaidRefiner for validating Mermaid diagram output with code fence stripping and diagram keyword checking. Add mermaid output type support to hono-app Playground, Travel, and Team LP pages.
- eb2ad1a: Add material validation system with declarative requirements and custom validators

  - New types: `MaterialPartType`, `MaterialRequirement`, `MaterialValidationResult`, `MaterialValidationIssue`
  - New functions: `validateMaterialRequirements()`, `runMaterialValidation()`
  - Recipe interface extended with optional `requiredMaterials` and `validateMaterials` fields

## 0.1.0

### Minor Changes

- 6d0601a: Type safety improvements: MaterialInput discriminated union, generic useAlchemy<TOutput>, custom error hierarchy, Language type hints. Alchemist.compare() now uses Promise.allSettled for partial failure resilience. TextRefiner adds getFormatInstructions(). VideoMaterialPart gains base64 support. Stub transforms throw by default. Remove unused ToolDefinition. Extract toMaterialParts() to core. Deduplicate Zod helpers in demo app.
