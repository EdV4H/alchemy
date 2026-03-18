---
"@edv4h/alchemy-core": minor
"@edv4h/alchemy-node": minor
---

Add material evaluation system for graded quality scoring

- New types: `MaterialEvaluation`, `MaterialEvaluationEntry`, `MaterialJudgement`
- `MaterialRequirement.evaluate` — per-material quality scoring (0-1)
- `Recipe.judgeMaterials` — aggregate evaluation to determine transmute eligibility
- `MaterialValidationResult` extended with `evaluations` and `judgement`
- `MaterialValidationError` error class with full result details
- `AlchemistConfig.validateMaterials` — auto-validate in transmute()/stream()
- **Breaking**: `runMaterialValidation` is now async (returns `Promise<MaterialValidationResult>`)
