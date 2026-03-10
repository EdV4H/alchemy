# @edv4h/alchemy-node

Node.js runtime for the Alchemy framework — the Alchemist orchestrator class with core re-exports.

## Install

```bash
pnpm add @edv4h/alchemy-core @edv4h/alchemy-node
```

You also need a transmuter plugin for your LLM provider:

```bash
pnpm add @edv4h/alchemy-plugin-transmuter-openai    # OpenAI
# pnpm add @edv4h/alchemy-plugin-transmuter-anthropic  # Anthropic
# pnpm add @edv4h/alchemy-plugin-transmuter-google     # Google Gemini
```

## Usage

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { OpenAITransmuter } from "@edv4h/alchemy-plugin-transmuter-openai";

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter({ apiKey: process.env.OPENAI_API_KEY }),
});

const result = await alchemist.transmute({
  recipe: {
    spell: { output: "Translate this to French" },
  },
  materials: [{ type: "text", text: "Hello, world!" }],
});

console.log(result.output);
// → "Bonjour, le monde !"
```

## What's Included

- **Alchemist** — Main orchestrator with `transmute()`, `stream()`, `compare()`, and `generate()`
- All `@edv4h/alchemy-core` exports are re-exported for convenience

## License

MIT
