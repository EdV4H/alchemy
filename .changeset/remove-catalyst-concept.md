---
"@edv4h/alchemy-core": major
"@edv4h/alchemy-node": major
"@edv4h/alchemy-react": major
"@edv4h/alchemy-plugin-transmuter-openai": major
"@edv4h/alchemy-plugin-transmuter-anthropic": major
"@edv4h/alchemy-plugin-transmuter-google": major
---

Remove Catalyst concept — flatten roleDefinition and temperature into Recipe and TransmutationOptions

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
