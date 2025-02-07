export class CustomError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NetworkError extends CustomError {
  constructor(details) {
    super("Network error occurred", details);
  }
}

export class ScraperError extends CustomError {
  constructor(details) {
    super("Scraper encountered an error", details);
  }
}

export class DataExtractionError extends CustomError {
  constructor(details) {
    super("Data extraction failed", details);
  }
}

export class InputValidationError extends CustomError {
  constructor(details) {
    super("Input validation failed some fields are missing", details);
  }
}
