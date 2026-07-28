/**
 * @file firebaseConstants.js
 * @description Centralized Firebase & Firestore Constants
 * @module backend/firebase/firebaseConstants
 *
 * All Firestore collection names, field names, storage keys,
 * and configuration constants are defined here.
 * Never hardcode collection names in service files.
 */

// ─────────────────────────────────────────────
// Firestore Collection Names
// ─────────────────────────────────────────────

/**
 * Firestore collection identifiers.
 * Use these constants wherever a collection name is needed.
 *
 * @enum {string}
 */
export const COLLECTIONS = Object.freeze({
  STUDENTS: "students",
  COURSES: "courses",
  GRADES: "grades",
  PROGRESS: "progress",
});

// ─────────────────────────────────────────────
// Firestore Field Names — Students Collection
// ─────────────────────────────────────────────

/**
 * Field names for the `students` Firestore collection.
 *
 * @enum {string}
 */
export const STUDENT_FIELDS = Object.freeze({
  ID: "id",
  NAME: "name",
  EMAIL: "email",
  AVATAR: "avatar",
  ATTENDANCE: "attendance",
  OVERALL_COMPLETION: "overallCompletion",
  PHONE: "phone",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
});

// ─────────────────────────────────────────────
// Firestore Field Names — Courses Collection
// ─────────────────────────────────────────────

/**
 * Field names for the `courses` Firestore collection.
 *
 * @enum {string}
 */
export const COURSE_FIELDS = Object.freeze({
  COURSE_ID: "courseId",
  TITLE: "title",
  DESCRIPTION: "description",
  THUMBNAIL: "thumbnail",
  INSTRUCTOR: "instructor",
  TOTAL_MODULES: "totalModules",
  COMPLETED_MODULES: "completedModules",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
});

// ─────────────────────────────────────────────
// Firestore Field Names — Grades Collection
// ─────────────────────────────────────────────

/**
 * Field names for the `grades` Firestore collection.
 *
 * @enum {string}
 */
export const GRADE_FIELDS = Object.freeze({
  STUDENT_ID: "studentId",
  COURSE_ID: "courseId",
  QUIZ: "quiz",
  ASSIGNMENT: "assignment",
  MIDTERM: "midterm",
  FINAL: "final",
  ATTENDANCE: "attendance",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
});

// ─────────────────────────────────────────────
// Firestore Field Names — Progress Collection
// ─────────────────────────────────────────────

/**
 * Field names for the `progress` Firestore collection.
 *
 * @enum {string}
 */
export const PROGRESS_FIELDS = Object.freeze({
  STUDENT_ID: "studentId",
  COURSE_ID: "courseId",
  COMPLETED_MODULES: "completedModules",
  TOTAL_MODULES: "totalModules",
  PERCENTAGE: "percentage",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
});

// ─────────────────────────────────────────────
// Course Status Values
// ─────────────────────────────────────────────

/**
 * Valid status values for a course record.
 *
 * @enum {string}
 */
export const COURSE_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  DRAFT: "draft",
});

// ─────────────────────────────────────────────
// Session & Storage Constants
// ─────────────────────────────────────────────

/**
 * Keys used in LocalStorage and SessionStorage.
 *
 * @enum {string}
 */
export const STORAGE_KEYS = Object.freeze({
  AUTH_USER: "edutrack_auth_user",
  LOGIN_TIMESTAMP: "edutrack_login_timestamp",
  LAST_ACTIVITY: "edutrack_last_activity",
  SESSION_ACTIVE: "edutrack_session_active",
  USER_ROLE: "edutrack_user_role",
});

// ─────────────────────────────────────────────
// Session Timeout Configuration
// ─────────────────────────────────────────────

/**
 * Session timeout configuration values (in milliseconds).
 *
 * @enum {number}
 */
export const SESSION_CONFIG = Object.freeze({
  /** 30 minutes in milliseconds */
  TIMEOUT_DURATION: 30 * 60 * 1000,
  /** Inactivity check interval: every 60 seconds */
  CHECK_INTERVAL: 60 * 1000,
  /** Warning threshold: 5 minutes before timeout */
  WARNING_THRESHOLD: 5 * 60 * 1000,
});

// ─────────────────────────────────────────────
// Validation Constants
// ─────────────────────────────────────────────

/**
 * Validation rules and limits.
 *
 * @enum {number|RegExp}
 */
export const VALIDATION = Object.freeze({
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
});

// ─────────────────────────────────────────────
// Firebase Auth Error Codes
// ─────────────────────────────────────────────

/**
 * Firebase Authentication error codes.
 * Used by authErrors.js for mapping to user-friendly messages.
 *
 * @enum {string}
 */
export const AUTH_ERROR_CODES = Object.freeze({
  INVALID_EMAIL: "auth/invalid-email",
  USER_DISABLED: "auth/user-disabled",
  USER_NOT_FOUND: "auth/user-not-found",
  WRONG_PASSWORD: "auth/wrong-password",
  EMAIL_IN_USE: "auth/email-already-in-use",
  WEAK_PASSWORD: "auth/weak-password",
  NETWORK_ERROR: "auth/network-request-failed",
  TOO_MANY_REQUESTS: "auth/too-many-requests",
  INVALID_CREDENTIAL: "auth/invalid-credential",
  OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
  REQUIRES_RECENT_LOGIN: "auth/requires-recent-login",
  EXPIRED_TOKEN: "auth/id-token-expired",
  SESSION_EXPIRED: "auth/session-expired",
});

// ─────────────────────────────────────────────
// Firestore Error Codes
// ─────────────────────────────────────────────

/**
 * Firestore error codes for centralized error handling.
 *
 * @enum {string}
 */
export const FIRESTORE_ERROR_CODES = Object.freeze({
  NOT_FOUND: "not-found",
  PERMISSION_DENIED: "permission-denied",
  UNAVAILABLE: "unavailable",
  ALREADY_EXISTS: "already-exists",
  INVALID_ARGUMENT: "invalid-argument",
  RESOURCE_EXHAUSTED: "resource-exhausted",
  DEADLINE_EXCEEDED: "deadline-exceeded",
  ABORTED: "aborted",
  INTERNAL: "internal",
  UNAUTHENTICATED: "unauthenticated",
});

// ─────────────────────────────────────────────
// Pagination Defaults
// ─────────────────────────────────────────────

/**
 * Default values for Firestore query pagination.
 *
 * @enum {number}
 */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
});
