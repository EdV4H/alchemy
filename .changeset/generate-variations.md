---
"@edv4h/alchemy-node": minor
"@edv4h/alchemy-react": minor
---

Add multi-variation generation feature: `Alchemist.generate()` runs the same recipe N times in parallel and returns `Record<string, TOutput | { error: Error }>`. Includes `useGenerate` hook and `useAlchemy` generate mode integration for React (per-variation results typed as `TOutput | { error: string }`), with ModeSelector/GenerateCountStepper/VariationResultsGrid UI components.
