export interface RecipeFieldMeta {
  name: string;
  type: string; // "string", "number", 'enum("a"|"b")', "string[]" etc.
  children?: RecipeFieldMeta[]; // nested object fields
}

export interface RecipeMeta {
  outputType: "text" | "json";
  schemaFields?: RecipeFieldMeta[]; // json only
  transforms: string[]; // human-readable e.g. "truncateText(2000)"
  promptTemplate: string; // spell summary
}
