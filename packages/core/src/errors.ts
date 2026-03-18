export class AlchemyError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AlchemyError";
  }
}

export class TransmuteError extends AlchemyError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransmuteError";
  }
}

export class RefineError extends AlchemyError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RefineError";
  }
}

export class TransformError extends AlchemyError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransformError";
  }
}

export class MaterialValidationError extends AlchemyError {
  readonly result: import("./types.js").MaterialValidationResult;
  constructor(result: import("./types.js").MaterialValidationResult) {
    super(result.message ?? result.judgement?.message ?? "Material validation failed");
    this.name = "MaterialValidationError";
    this.result = result;
  }
}
