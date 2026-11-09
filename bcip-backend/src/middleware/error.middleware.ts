/**
 * DEAD CODE — duplicate error handler.
 *
 * The active global error handler is: src/middleware/errorHandler.ts
 * The active AppError class is:       src/utils/error.ts
 *
 * This file exports a second AppError and errorHandler that are not referenced
 * anywhere. Having two AppError classes causes instanceof checks to behave
 * incorrectly if both are accidentally imported.
 *
 * This file is intentionally empty. Do not import from this file.
 */

export {};