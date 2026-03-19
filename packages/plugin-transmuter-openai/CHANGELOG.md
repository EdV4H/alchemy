# @edv4h/alchemy-plugin-transmuter-openai

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

- e6b0aaa: Move LLM SDK dependencies to peerDependencies in transmuter plugins, update alchemy-node description, fix docs-site import paths, and add README files for all packages
- 736731a: Extract Transmuter and Node Transform into independent plugin packages

  - `@edv4h/alchemy-plugin-transmuter-anthropic`: Anthropic (Claude) transmuter
  - `@edv4h/alchemy-plugin-transmuter-openai`: OpenAI transmuter
  - `@edv4h/alchemy-plugin-transmuter-google`: Google (Gemini) transmuter
  - `@edv4h/alchemy-plugin-transforms-node`: Node.js material transforms (imageUrlToBase64, documentToText, audioToText, videoToFrames)

  `@edv4h/alchemy-node` is now a facade that re-exports from the plugin packages, maintaining full backward compatibility.

### Patch Changes

- Updated dependencies [4f54990]
- Updated dependencies [f6eda47]
- Updated dependencies [a6ef47b]
- Updated dependencies [eb2ad1a]
  - @edv4h/alchemy-core@1.0.0
