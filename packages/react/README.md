# @edv4h/alchemy-react

React hooks for the Alchemy framework — headless UI primitives for LLM-powered components.

## Install

```bash
pnpm add @edv4h/alchemy-react
```

**Peer dependency:** `react@^18.0.0 || ^19.0.0`

## Usage

```tsx
import { useAlchemy } from "@edv4h/alchemy-react";

function TranslatorApp() {
  const { transmute, result, isLoading, error } = useAlchemy<{ translation: string }>({
    initialRecipeId: "translate",
    baseUrl: "/api",
  });

  return (
    <div>
      <button onClick={() => transmute([{ type: "text", text: "Hello" }])}>
        Translate
      </button>
      {isLoading && <p>Loading...</p>}
      {result && <p>{result.translation}</p>}
    </div>
  );
}
```

## Hooks

- **`useAlchemy`** — Full-featured hook with recipe selection, catalyst switching, and state management
- **`useTransmute`** — Simplified hook for single transmutation
- **`useCompare`** — A/B comparison across multiple catalysts
- **`useGenerate`** — Generate multiple variations in parallel

## License

MIT
