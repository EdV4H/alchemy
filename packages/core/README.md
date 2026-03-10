# @edv4h/alchemy-core

Core library for the Alchemy framework — type definitions, Refiners, Material utilities, and Transform helpers.

## Install

```bash
pnpm add @edv4h/alchemy-core
```

## What's Included

- **Refiners** — `TextRefiner`, `JsonRefiner`, `MermaidRefiner`
- **Transforms** — `truncateText`, `prependText`, `filterByType`, `dataToText`
- **Material utilities** — `extractText`, `extractAllText`, `isTextOnly`, `toMaterialParts`
- **Validation** — `runMaterialValidation`, `validateMaterialRequirements`
- **Types** — `MaterialPart`, `Recipe`, `Transmuter`, `CatalystConfig`, `Refiner`, etc.

## Usage

```ts
import { JsonRefiner, truncateText } from "@edv4h/alchemy-core";
import { z } from "zod";

const refiner = new JsonRefiner(z.object({
  summary: z.string(),
  tags: z.array(z.string()),
}));
```

## License

MIT
