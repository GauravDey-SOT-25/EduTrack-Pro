/**
 * @file validators.js
 * @description Input Validation Utilities for Authentication and Data Forms
 * @module backend/auth/validators
 *
 * Provides pure validation functions used before any Firebase calls.
 * All validators return a structured result object { valid, error }.
 * No Firebase dependencies — pure JavaScript validation only.
 */

import { VALIDATION } from "../firebase/firebaseConstants.js";

// ─────────────────────────────────────────────
// Validation Result Factory
// ─────────────────────────────────────────────

/**
 * Creates a standardized validation result object.
 *
 * @param {boolean} valid - Whether validation passed.
 * @param {string|null} [error=null] - Error message if validation failed.
 * @returns {{ valid: boolean, error: string|null }}
 */
const createResult = (valid, error = null) => ({ valid, error });

// ─────────────────────────────────────────────
// Primitive Validators
// ─────────────────────────────────────────────

/**
 * Validates that a value is a non-empty string after trimming.
 *
 * @param {*} value - The value to check.
 * @param {string} fieldName - Human-readable field name for error messages.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (value === null || value === undefined) {
    return createResult(false, `${fieldName} is required.`);
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return createResult(false, `${fieldName} cannot be empty.`);
  }
  return createResult(true);
};

/**
 * Validates email format using RFC 5322 simplified regex.
 *
 * @param {string} email - The email address to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateEmail = (email) => {
  const requiredCheck = validateRequired(email, "Email");
  if (!requiredCheck.valid) return requiredCheck;

  if (!VALIDATION.EMAIL_REGEX.test(email.trim())) {
    return createResult(false, "Please enter a valid email address.");
  }
  return createResult(true);
};

/**
 * Validates password meets minimum security requirements.
 *
 * @param {string} password - The password to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validatePassword = (password) => {
  const requiredCheck = validateRequired(password, "Password");
  if (!requiredCheck.valid) return requiredCheck;

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return createResult(
      false,
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long.`
    );
  }
  return createResult(true);
};

/**
 * Validates that two password strings match (for registration flows).
 *
 * @param {string} password - Original password.
 * @param {string} confirmPassword - Confirmation password.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return createResult(false, "Passwords do not match.");
  }
  return createResult(true);
};

/**
 * Validates a person's name for length and character constraints.
 *
 * @param {string} name - The name value to validate.
 * @param {string} [fieldName="Name"] - Human-readable field label.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateName = (name, fieldName = "Name") => {
  const requiredCheck = validateRequired(name, fieldName);
  if (!requiredCheck.valid) return requiredCheck;

  const trimmed = name.trim();
  if (trimmed.length < VALIDATION.NAME_MIN_LENGTH) {
    return createResult(
      false,
      `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters.`
    );
  }
  if (trimmed.length > VALIDATION.NAME_MAX_LENGTH) {
    return createResult(
      false,
      `${fieldName} must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters.`
    );
  }
  return createResult(true);
};

/**
 * Validates an international phone number format.
 *
 * @param {string} phone - The phone number to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validatePhone = (phone) => {
  if (!phone) return createResult(true); // Phone is optional
  if (!VALIDATION.PHONE_REGEX.test(phone.trim())) {
    return createResult(
      false,
      "Please enter a valid phone number (e.g. +911234567890)."
    );
  }
  return createResult(true);
};

/**
 * Validates that a numeric value falls within an inclusive range.
 *
 * @param {number} value - The number to validate.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @param {string} [fieldName="Value"] - Human-readable field label.
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateRange = (value, min, max, fieldName = "Value") => {
  const num = Number(value);
  if (isNaN(num)) {
    return createResult(false, `${fieldName} must be a valid number.`);
  }
  if (num < min || num > max) {
    return createResult(
      false,
      `${fieldName} must be between ${min} and ${max}.`
    );
  }
  return createResult(true);
};

// ─────────────────────────────────────────────
// Composite Form Validators
// ─────────────────────────────────────────────

/**
 * Validates a complete login form payload.
 *
 * @param {{ email: string, password: string }} credentials - Login form data.
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  const emailResult = validateEmail(email);
  if (!emailResult.valid) errors.email = emailResult.error;

  const passwordResult = validateRequired(password, "Password");
  if (!passwordResult.valid) errors.password = passwordResult.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a complete student registration/creation payload.
 *
 * @param {{ name: string, email: string, phone?: string, password?: string }} studentData - Student form data.
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export const validateStudentForm = ({ name, email, phone, password }) => {
  const errors = {};

  const nameResult = validateName(name, "Full Name");
  if (!nameResult.valid) errors.name = nameResult.error;

  const emailResult = validateEmail(email);
  if (!emailResult.valid) errors.email = emailResult.error;

  if (phone) {
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) errors.phone = phoneResult.error;
  }

  if (password !== undefined) {
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) errors.password = passwordResult.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a grade record payload.
 *
 * @param {{ studentId: string, courseId: string, quiz: number, assignment: number, midterm: number, final: number, attendance: number }} gradeData
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export const validateGradeForm = ({
  studentId,
  courseId,
  quiz,
  assignment,
  midterm,
  final: finalGrade,
  attendance,
}) => {
  const errors = {};

  const studentIdCheck = validateRequired(studentId, "Student ID");
  if (!studentIdCheck.valid) errors.studentId = studentIdCheck.error;

  const courseIdCheck = validateRequired(courseId, "Course ID");
  if (!courseIdCheck.valid) errors.courseId = courseIdCheck.error;

  const gradeFields = { quiz, assignment, midterm, final: finalGrade };
  for (const [field, value] of Object.entries(gradeFields)) {
    const result = validateRange(value, 0, 100, field);
    if (!result.valid) errors[field] = result.error;
  }

  const attendanceResult = validateRange(attendance, 0, 100, "Attendance");
  if (!attendanceResult.valid) errors.attendance = attendanceResult.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a course progress payload.
 *
 * @param {{ studentId: string, courseId: string, completedModules: number, totalModules: number }} progressData
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export const validateProgressForm = ({
  studentId,
  courseId,
  completedModules,
  totalModules,
}) => {
  const errors = {};

  const studentIdCheck = validateRequired(studentId, "Student ID");
  if (!studentIdCheck.valid) errors.studentId = studentIdCheck.error;

  const courseIdCheck = validateRequired(courseId, "Course ID");
  if (!courseIdCheck.valid) errors.courseId = courseIdCheck.error;

  if (Number(completedModules) > Number(totalModules)) {
    errors.completedModules =
      "Completed modules cannot exceed total modules.";
  }

  const completedResult = validateRange(
    completedModules,
    0,
    Number(totalModules) || 9999,
    "Completed Modules"
  );
  if (!completedResult.valid) errors.completedModules = completedResult.error;

  const totalResult = validateRange(totalModules, 1, 9999, "Total Modules");
  if (!totalResult.valid) errors.totalModules = totalResult.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
