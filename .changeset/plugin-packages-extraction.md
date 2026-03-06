---
"@edv4h/alchemy-plugin-transmuter-anthropic": minor
"@edv4h/alchemy-plugin-transmuter-openai": minor
"@edv4h/alchemy-plugin-transmuter-google": minor
"@edv4h/alchemy-plugin-transforms-node": minor
"@edv4h/alchemy-node": minor
---

Extract Transmuter and Node Transform into independent plugin packages

- `@edv4h/alchemy-plugin-transmuter-anthropic`: Anthropic (Claude) transmuter
- `@edv4h/alchemy-plugin-transmuter-openai`: OpenAI transmuter
- `@edv4h/alchemy-plugin-transmuter-google`: Google (Gemini) transmuter
- `@edv4h/alchemy-plugin-transforms-node`: Node.js material transforms (imageUrlToBase64, documentToText, audioToText, videoToFrames)

`@edv4h/alchemy-node` is now a facade that re-exports from the plugin packages, maintaining full backward compatibility.
