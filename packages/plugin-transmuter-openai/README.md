# @edv4h/alchemy-plugin-transmuter-openai

OpenAI transmuter plugin for the Alchemy framework — connects to GPT-4o, GPT-4o-mini, and other OpenAI models.

## Install

```bash
pnpm add @edv4h/alchemy-plugin-transmuter-openai openai
```

**Peer dependency:** `openai@^4.100.0`

## Usage

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { OpenAITransmuter } from "@edv4h/alchemy-plugin-transmuter-openai";

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter({
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: "gpt-4o",
  }),
});
```

## Configuration

```ts
interface OpenAITransmuterConfig {
  apiKey?: string;       // defaults to OPENAI_API_KEY env var
  defaultModel?: string; // defaults to "gpt-4o-mini"
  baseURL?: string;      // custom API endpoint
}
```

## License

MIT
