# @edv4h/alchemy-plugin-transforms-node

Node.js-specific material transforms for the Alchemy framework — image conversion, document extraction, and more.

## Install

```bash
pnpm add @edv4h/alchemy-plugin-transforms-node
```

## Usage

```ts
import { Alchemist } from "@edv4h/alchemy-node";
import { OpenAITransmuter } from "@edv4h/alchemy-plugin-transmuter-openai";
import { imageUrlToBase64, documentToText } from "@edv4h/alchemy-plugin-transforms-node";

const alchemist = new Alchemist({
  transmuter: new OpenAITransmuter(),
  transforms: [
    imageUrlToBase64(),  // Convert image URLs to base64 for API
    documentToText(),    // Extract text from documents
  ],
});
```

## Transforms

- **`imageUrlToBase64()`** — Fetches remote images and converts to base64
- **`documentToText()`** — Extracts text from document parts
- **`audioToText()`** — Audio transcription (stub support)
- **`videoToFrames()`** — Video frame extraction (stub support)

## License

MIT
