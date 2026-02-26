---
"@edv4h/alchemy-core": minor
"@edv4h/alchemy-node": minor
"@edv4h/alchemy-react": minor
---

Type safety improvements: MaterialInput discriminated union, generic useAlchemy<TOutput>, custom error hierarchy, Language type hints. Alchemist.compare() now uses Promise.allSettled for partial failure resilience. TextRefiner adds getFormatInstructions(). VideoMaterialPart gains base64 support. Stub transforms throw by default. Remove unused ToolDefinition. Extract toMaterialParts() to core. Deduplicate Zod helpers in demo app.
