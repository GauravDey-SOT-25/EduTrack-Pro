/**
 * @file studentService.js
 * @description Student API — Firestore CRUD for the "students" Collection
 * @module backend/api/studentService
 *
 * All operations are routed through firestoreHelpers.js.
 * HTML pages must never call Firestore directly — use this service.
 *
 * Available Methods:
 *  - createStudent(data)
 *  - getAllStudents(options?)
 *  - getStudentById(studentId)
 *  - getStudentByEmail(email)
 *  - updateStudent(studentId, updates)
 *  - deleteStudent(studentId)
 *  - searchStudentsByName(nameQuery)
 *  - getStudentWithFullProfile(studentId)
 */

import { COLLECTIONS, STUDENT_FIELDS } from "../firebase/firebaseConstants.js";
import {
  addDocument,
  getDocumentById,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument,
} from "../database/firestoreHelpers.js";
import { validateStudentForm } from "../auth/validators.js";
import {
  createValidationError,
  createSuccessResponse,
  createNotFoundError,
} from "../errors/authErrors.js";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Creates a new student record in the "students" Firestore collection.
 * Validates all required fields before writing to the database.
 *
 * @param {{ name: string, email: string, phone?: string, avatar?: string, attendance?: number, overallCompletion?: number }} studentData
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await createStudent({
 *   name: "Alice Johnson",
 *   email: "alice@school.edu",
 *   phone: "+911234567890",
 *   attendance: 90,
 *   overallCompletion: 75,
 * });
 */
export const createStudent = async (studentData) => {
  const validation = validateStudentForm(studentData);
  if (!validation.valid) {
    return createValidationError(
      "Student data is invalid. Please fix the errors.",
      validation.errors
    );
  }

  const payload = {
    [STUDENT_FIELDS.NAME]: studentData.name.trim(),
    [STUDENT_FIELDS.EMAIL]: studentData.email.trim().toLowerCase(),
    [STUDENT_FIELDS.PHONE]: studentData.phone?.trim() ?? null,
    [STUDENT_FIELDS.AVATAR]: studentData.avatar ?? _generateAvatarUrl(studentData.name),
    [STUDENT_FIELDS.ATTENDANCE]: studentData.attendance ?? 0,
    [STUDENT_FIELDS.OVERALL_COMPLETION]: studentData.overallCompletion ?? 0,
  };

  return addDocument(COLLECTIONS.STUDENTS, payload);
};

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Retrieves all students from the "students" collection.
 *
 * @param {Object} [options] - Optional pagination/ordering config.
 * @param {string} [options.orderByField="name"] - Field to sort by.
 * @param {"asc"|"desc"} [options.orderDirection="asc"] - Sort direction.
 * @param {number} [options.pageSize=20] - Max documents to return.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getAllStudents({ pageSize: 50 });
 */
export const getAllStudents = async (options = {}) => {
  const defaults = {
    orderByField: STUDENT_FIELDS.NAME,
    orderDirection: "asc",
    ...options,
  };
  return getAllDocuments(COLLECTIONS.STUDENTS, defaults);
};

/**
 * Retrieves a single student record by their Firestore document ID.
 *
 * @param {string} studentId - Firestore document ID of the student.
 * @returns {Promise<{ success: boolean, data?: Object, message: string }>}
 *
 * @example
 * const result = await getStudentById("abc123");
 */
export const getStudentById = async (studentId) => {
  if (!studentId) return createNotFoundError("Student");
  return getDocumentById(COLLECTIONS.STUDENTS, studentId);
};

/**
 * Retrieves a student record by their email address.
 *
 * @param {string} email - Email address to search for.
 * @returns {Promise<{ success: boolean, data?: Object|null, message: string }>}
 *
 * @example
 * const result = await getStudentByEmail("alice@school.edu");
 */
export const getStudentByEmail = async (email) => {
  const result = await queryDocuments(COLLECTIONS.STUDENTS, [
    [STUDENT_FIELDS.EMAIL, "==", email.trim().toLowerCase()],
  ]);

  if (!result.success) return result;
  if (result.data.length === 0) return createNotFoundError("Student");

  return createSuccessResponse(result.data[0]);
};

/**
 * Searches for students whose name contains the given query (case-sensitive prefix).
 * Note: Firestore does not support native full-text search. This performs a
 * range query on the name field using alphabetical bounds.
 *
 * @param {string} nameQuery - Partial name string to search for.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await searchStudentsByName("Ali");
 */
export const searchStudentsByName = async (nameQuery) => {
  const trimmed = nameQuery?.trim();
  if (!trimmed) return createValidationError("Search query cannot be empty.");

  return queryDocuments(COLLECTIONS.STUDENTS, [
    [STUDENT_FIELDS.NAME, ">=", trimmed],
    [STUDENT_FIELDS.NAME, "<=", trimmed + "\uf8ff"],
  ]);
};

/**
 * Retrieves a student's full profile by aggregating their student record,
 * grades, and progress data from Firestore.
 *
 * @param {string} studentId - Firestore document ID.
 * @returns {Promise<{ success: boolean, data?: { student: Object, grades: Array, progress: Array }, message: string }>}
 *
 * @example
 * const result = await getStudentWithFullProfile("abc123");
 */
export const getStudentWithFullProfile = async (studentId) => {
  const [studentResult, gradesResult, progressResult] = await Promise.all([
    getDocumentById(COLLECTIONS.STUDENTS, studentId),
    queryDocuments(COLLECTIONS.GRADES, [["studentId", "==", studentId]]),
    queryDocuments(COLLECTIONS.PROGRESS, [["studentId", "==", studentId]]),
  ]);

  if (!studentResult.success) return studentResult;

  return createSuccessResponse({
    student: studentResult.data,
    grades: gradesResult.success ? gradesResult.data : [],
    progress: progressResult.success ? progressResult.data : [],
  });
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Updates specific fields of a student record.
 * Only provided fields are changed; omitted fields remain untouched.
 *
 * @param {string} studentId - Firestore document ID of the student.
 * @param {Partial<{ name: string, email: string, phone: string, avatar: string, attendance: number, overallCompletion: number }>} updates
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateStudent("abc123", { attendance: 95, overallCompletion: 80 });
 */
export const updateStudent = async (studentId, updates) => {
  if (!studentId) return createNotFoundError("Student");

  const sanitized = {};
  if (updates.name !== undefined) sanitized[STUDENT_FIELDS.NAME] = updates.name.trim();
  if (updates.email !== undefined)
    sanitized[STUDENT_FIELDS.EMAIL] = updates.email.trim().toLowerCase();
  if (updates.phone !== undefined) sanitized[STUDENT_FIELDS.PHONE] = updates.phone?.trim() ?? null;
  if (updates.avatar !== undefined) sanitized[STUDENT_FIELDS.AVATAR] = updates.avatar;
  if (updates.attendance !== undefined) sanitized[STUDENT_FIELDS.ATTENDANCE] = updates.attendance;
  if (updates.overallCompletion !== undefined)
    sanitized[STUDENT_FIELDS.OVERALL_COMPLETION] = updates.overallCompletion;

  return updateDocument(COLLECTIONS.STUDENTS, studentId, sanitized);
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Deletes a student record from Firestore by their document ID.
 *
 * @param {string} studentId - Firestore document ID of the student to delete.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await deleteStudent("abc123");
 */
export const deleteStudent = async (studentId) => {
  if (!studentId) return createNotFoundError("Student");
  return deleteDocument(COLLECTIONS.STUDENTS, studentId);
};

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

/**
 * Generates a deterministic avatar URL from the student's name
 * using the UI Avatars service.
 *
 * @private
 * @param {string} name - The student's full name.
 * @returns {string} Avatar image URL.
 */
const _generateAvatarUrl = (name) => {
  const encoded = encodeURIComponent(name?.trim() ?? "Student");
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=128&bold=true`;
};
