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
