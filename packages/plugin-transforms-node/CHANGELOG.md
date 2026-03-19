# @edv4h/alchemy-plugin-transforms-node

## 0.2.0

### Minor Changes

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
