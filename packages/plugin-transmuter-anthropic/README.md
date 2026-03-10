# @edv4h/alchemy-plugin-transmuter-anthropic

Anthropic (Claude) transmuter plugin for the Alchemy framework — connects to Claude models via the Anthropic SDK.

## Install

```bash
pnpm add @edv4h/alchemy-plugin-transmuter-anthropic @anthropic-ai/sdk
```

**Peer dependency:** `@anthropic-ai/sdk@^0.39.0`

## Usage

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { AnthropicTransmuter } from "@edv4h/alchemy-plugin-transmuter-anthropic";

const alchemist = new Alchemist({
  transmuter: new AnthropicTransmuter({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
});
```

## Configuration

```ts
interface AnthropicTransmuterConfig {
  apiKey?: string;       // defaults to ANTHROPIC_API_KEY env var
  defaultModel?: string; // defaults to "claude-sonnet-4-20250514"
}
```

## License

MIT
