# @edv4h/alchemy-plugin-transmuter-google

Google (Gemini) transmuter plugin for the Alchemy framework — connects to Gemini models via the Google Generative AI SDK.

## Install

```bash
pnpm add @edv4h/alchemy-plugin-transmuter-google @google/generative-ai
```

**Peer dependency:** `@google/generative-ai@^0.24.0`

## Usage

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { GoogleTransmuter } from "@edv4h/alchemy-plugin-transmuter-google";

const alchemist = new Alchemist({
  transmuter: new GoogleTransmuter({
    apiKey: process.env.GOOGLE_API_KEY,
  }),
});
```

## Configuration

```ts
interface GoogleTransmuterConfig {
  apiKey?: string;       // defaults to GOOGLE_API_KEY env var
  defaultModel?: string; // defaults to "gemini-1.5-flash"
}
```

## License

MIT
