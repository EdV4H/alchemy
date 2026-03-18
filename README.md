# Alchemy

Type-safe LLM orchestration framework for TypeScript.

Define recipes, transform multimodal inputs, and get validated outputs — all with full type inference.

## Packages

| Package | Description |
|---------|-------------|
| [`@edv4h/alchemy-core`](./packages/core) | Type definitions, Refiners, Material utilities, and Transform helpers |
| [`@edv4h/alchemy-node`](./packages/node) | Alchemist orchestrator class with core re-exports |
| [`@edv4h/alchemy-react`](./packages/react) | React hooks for LLM-powered UIs |
| [`@edv4h/alchemy-plugin-transmuter-openai`](./packages/plugin-transmuter-openai) | OpenAI transmuter plugin |
| [`@edv4h/alchemy-plugin-transmuter-anthropic`](./packages/plugin-transmuter-anthropic) | Anthropic transmuter plugin |
| [`@edv4h/alchemy-plugin-transmuter-google`](./packages/plugin-transmuter-google) | Google Gemini transmuter plugin |
| [`@edv4h/alchemy-plugin-transforms-node`](./packages/plugin-transforms-node) | Node.js-specific material transforms |

## Quick Start

```bash
pnpm add @edv4h/alchemy-core @edv4h/alchemy-node @edv4h/alchemy-plugin-transmuter-openai zod
```

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { OpenAITransmuter } from "@edv4h/alchemy-plugin-transmuter-openai";
import { JsonRefiner } from "@edv4h/alchemy-core";
import { z } from "zod";

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter({ apiKey: process.env.OPENAI_API_KEY }),
});

const result = await alchemist.transmute({
  recipe: {
    spell: { output: "Summarize this text in 3 bullet points" },
    refiner: new JsonRefiner(z.object({
      bullets: z.array(z.string()).length(3),
    })),
  },
  materials: [{ type: "text", text: "Your long document here..." }],
});

console.log(result.output.bullets);
// → ["Point 1", "Point 2", "Point 3"]  ✓ Fully typed!
```

## Architecture

Every request flows through a composable pipeline:

```
Material → Transform → Spell → Transmuter → Refiner → Typed Output
```

- **Material** — Multimodal inputs (text, image, audio, video, document, data)
- **Transform** — Preprocessing functions that modify materials
- **Spell** — The prompt / instruction
- **Transmuter** — LLM provider adapter (OpenAI, Anthropic, Google)
- **Refiner** — Output parser and validator (Text, JSON/Zod, Mermaid)
- **Recipe** — A reusable formula combining spell, refiner, and transforms

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## License

MIT
