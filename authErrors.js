/**
 * @file authErrors.js
 * @description Centralized Firebase Authentication & Firestore Error Handler
 * @module backend/errors/authErrors
 *
 * Maps raw Firebase error codes to safe, user-friendly messages.
 * Raw Firebase errors are NEVER exposed to the UI layer.
 * All service files must use this module before returning errors.
 */

import {
  AUTH_ERROR_CODES,
  FIRESTORE_ERROR_CODES,
} from "../firebase/firebaseConstants.js";

// ─────────────────────────────────────────────
// Auth Error Message Map
// ─────────────────────────────────────────────

/**
 * Mapping of Firebase Auth error codes to user-friendly messages.
 *
 * @type {Object.<string, string>}
 */
const AUTH_ERROR_MESSAGES = Object.freeze({
  [AUTH_ERROR_CODES.INVALID_EMAIL]:
    "The email address format is invalid. Please check and try again.",
  [AUTH_ERROR_CODES.USER_DISABLED]:
    "This account has been disabled. Please contact support.",
  [AUTH_ERROR_CODES.USER_NOT_FOUND]:
    "No account found with this email address.",
  [AUTH_ERROR_CODES.WRONG_PASSWORD]:
    "Incorrect password. Please try again.",
  [AUTH_ERROR_CODES.EMAIL_IN_USE]:
    "An account with this email already exists.",
  [AUTH_ERROR_CODES.WEAK_PASSWORD]:
    "Password is too weak. Please use at least 8 characters.",
  [AUTH_ERROR_CODES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]:
    "Too many failed attempts. Please wait a few minutes and try again.",
  [AUTH_ERROR_CODES.INVALID_CREDENTIAL]:
    "Invalid credentials. Please check your email and password.",
  [AUTH_ERROR_CODES.OPERATION_NOT_ALLOWED]:
    "This sign-in method is not enabled. Please contact support.",
  [AUTH_ERROR_CODES.REQUIRES_RECENT_LOGIN]:
    "Please log out and log back in to perform this action.",
  [AUTH_ERROR_CODES.EXPIRED_TOKEN]:
    "Your session has expired. Please log in again.",
  [AUTH_ERROR_CODES.SESSION_EXPIRED]:
    "Your session has expired. Please log in again.",
});

// ─────────────────────────────────────────────
// Firestore Error Message Map
// ─────────────────────────────────────────────

/**
 * Mapping of Firestore error codes to user-friendly messages.
 *
 * @type {Object.<string, string>}
 */
const FIRESTORE_ERROR_MESSAGES = Object.freeze({
  [FIRESTORE_ERROR_CODES.NOT_FOUND]:
    "The requested record was not found.",
  [FIRESTORE_ERROR_CODES.PERMISSION_DENIED]:
    "You do not have permission to perform this action.",
  [FIRESTORE_ERROR_CODES.UNAVAILABLE]:
    "The database is temporarily unavailable. Please try again.",
  [FIRESTORE_ERROR_CODES.ALREADY_EXISTS]:
    "A record with this identifier already exists.",
  [FIRESTORE_ERROR_CODES.INVALID_ARGUMENT]:
    "Invalid data provided. Please review your input.",
  [FIRESTORE_ERROR_CODES.RESOURCE_EXHAUSTED]:
    "Service quota exceeded. Please try again later.",
  [FIRESTORE_ERROR_CODES.DEADLINE_EXCEEDED]:
    "The request timed out. Please try again.",
  [FIRESTORE_ERROR_CODES.ABORTED]:
    "The operation was aborted. Please try again.",
  [FIRESTORE_ERROR_CODES.INTERNAL]:
    "An internal server error occurred. Please try again.",
  [FIRESTORE_ERROR_CODES.UNAUTHENTICATED]:
    "Authentication required. Please log in to continue.",
});

// ─────────────────────────────────────────────
// Default Fallback Message
// ─────────────────────────────────────────────

/**
 * Generic fallback error message for unrecognized error codes.
 *
 * @type {string}
 */
const DEFAULT_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again or contact support.";

// ─────────────────────────────────────────────
// Error Resolution Functions
// ─────────────────────────────────────────────

/**
 * Resolves a Firebase Authentication error into a safe error response object.
 * Never exposes raw Firebase error codes or messages to the caller.
 *
 * @param {import("firebase/app").FirebaseError} error - Raw Firebase error object.
 * @returns {{ success: false, code: string, message: string }} Structured error response.
 *
 * @example
 * const result = resolveAuthError(error);
 * // → { success: false, code: "auth/user-not-found", message: "No account found..." }
 */
export const resolveAuthError = (error) => {
  const code = error?.code ?? "unknown";
  const message =
    AUTH_ERROR_MESSAGES[code] ??
    FIRESTORE_ERROR_MESSAGES[code] ??
    DEFAULT_ERROR_MESSAGE;

  return {
    success: false,
    code,
    message,
  };
};

/**
 * Resolves a Firestore operation error into a safe error response object.
 *
 * @param {import("firebase/app").FirebaseError} error - Raw Firestore error.
 * @returns {{ success: false, code: string, message: string }} Structured error response.
 *
 * @example
 * const result = resolveFirestoreError(error);
 * // → { success: false, code: "not-found", message: "The requested record..." }
 */
export const resolveFirestoreError = (error) => {
  const code = error?.code ?? "unknown";
  const message =
    FIRESTORE_ERROR_MESSAGES[code] ??
    AUTH_ERROR_MESSAGES[code] ??
    DEFAULT_ERROR_MESSAGE;

  return {
    success: false,
    code,
    message,
  };
};

/**
 * Creates a standardized success response object for service functions.
 *
 * @param {*} data - The returned data payload.
 * @param {string} [message="Operation successful."] - Optional success message.
 * @returns {{ success: true, data: *, message: string }} Structured success response.
 *
 * @example
 * return createSuccessResponse(student);
 * // → { success: true, data: { id: "...", name: "..." }, message: "Operation successful." }
 */
export const createSuccessResponse = (data, message = "Operation successful.") => ({
  success: true,
  data,
  message,
});

/**
 * Creates a standardized validation error response (non-Firebase).
 *
 * @param {string} message - Validation error message.
 * @param {Object} [errors={}] - Field-level validation errors map.
 * @returns {{ success: false, code: string, message: string, errors: Object }}
 */
export const createValidationError = (message, errors = {}) => ({
  success: false,
  code: "validation-error",
  message,
  errors,
});

/**
 * Creates a standardized not-found error response.
 *
 * @param {string} resourceName - Name of the resource that was not found.
 * @returns {{ success: false, code: string, message: string }}
 */
export const createNotFoundError = (resourceName = "Record") => ({
  success: false,
  code: "not-found",
  message: `${resourceName} was not found.`,
});
