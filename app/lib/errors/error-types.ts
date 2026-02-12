/**
 * Error Types for Lexica
 * Custom error classes for different error scenarios
 */

/**
 * Base error class for Lexica errors
 */
export class LexicaError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "LexicaError";
  }
}

/**
 * Markdown parsing error
 */
export class ParseError extends LexicaError {
  constructor(message: string) {
    super(message, "PARSE_ERROR");
    this.name = "ParseError";
  }
}

/**
 * File loading error
 */
export class LoadError extends LexicaError {
  constructor(message: string) {
    super(message, "LOAD_ERROR");
    this.name = "LoadError";
  }
}

/**
 * IndexedDB storage error
 */
export class StorageError extends LexicaError {
  constructor(message: string) {
    super(message, "STORAGE_ERROR");
    this.name = "StorageError";
  }
}

/**
 * Validation error
 */
export class ValidationError extends LexicaError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ParseError) {
    return "Failed to parse document. The file may be corrupted or in an unsupported format.";
  }
  
  if (error instanceof LoadError) {
    return error.message;
  }
  
  if (error instanceof StorageError) {
    return "Failed to save reading progress. Storage may be full or unavailable.";
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  // Storage errors are recoverable (can continue without saving)
  if (error instanceof StorageError) {
    return true;
  }
  
  // Load errors are recoverable (can try different file)
  if (error instanceof LoadError) {
    return true;
  }
  
  // Parse errors are recoverable (can try different file)
  if (error instanceof ParseError) {
    return true;
  }
  
  // Validation errors are recoverable
  if (error instanceof ValidationError) {
    return true;
  }
  
  return false;
}
