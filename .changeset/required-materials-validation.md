---
"@edv4h/alchemy-core": minor
"@edv4h/alchemy-node": minor
---

Add material validation system with declarative requirements and custom validators

- New types: `MaterialPartType`, `MaterialRequirement`, `MaterialValidationResult`, `MaterialValidationIssue`
- New functions: `validateMaterialRequirements()`, `runMaterialValidation()`
- Recipe interface extended with optional `requiredMaterials` and `validateMaterials` fields
