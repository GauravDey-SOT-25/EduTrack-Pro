/**
 * @file progressService.js
 * @description Progress API — Firestore CRUD for the "progress" Collection
 * @module backend/api/progressService
 *
 * Tracks module-level completion per student per course.
 * Auto-calculates the completion percentage on every write.
 *
 * All operations are routed through firestoreHelpers.js.
 * HTML pages must never call Firestore directly — use this service.
 *
 * Available Methods:
 *  - createProgress(data)
 *  - getAllProgress(options?)
 *  - getProgressById(progressId)
 *  - getProgressByStudent(studentId)
 *  - getProgressByCourse(courseId)
 *  - getProgressByStudentAndCourse(studentId, courseId)
 *  - updateProgress(progressId, updates)
 *  - incrementCompletedModules(progressId)
 *  - deleteProgress(progressId)
 *  - getStudentOverallCompletion(studentId)
 */

import { COLLECTIONS, PROGRESS_FIELDS } from "../firebase/firebaseConstants.js";
import {
  addDocument,
  getDocumentById,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument,
} from "../database/firestoreHelpers.js";
import { validateProgressForm } from "../auth/validators.js";
import {
  createValidationError,
  createSuccessResponse,
  createNotFoundError,
} from "../errors/authErrors.js";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Creates a new progress record in the "progress" Firestore collection.
 * Automatically calculates and stores the completion percentage.
 *
 * @param {{ studentId: string, courseId: string, completedModules: number, totalModules: number }} progressData
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await createProgress({
 *   studentId: "STU_001",
 *   courseId: "COURSE_001",
 *   completedModules: 6,
 *   totalModules: 12,
 * });
 * // Stores percentage: 50
 */
export const createProgress = async (progressData) => {
  const validation = validateProgressForm(progressData);
  if (!validation.valid) {
    return createValidationError("Progress data is invalid.", validation.errors);
  }

  const completed = Number(progressData.completedModules);
  const total = Number(progressData.totalModules);
  const percentage = _calcPercentage(completed, total);

  const payload = {
    [PROGRESS_FIELDS.STUDENT_ID]: progressData.studentId.trim(),
    [PROGRESS_FIELDS.COURSE_ID]: progressData.courseId.trim(),
    [PROGRESS_FIELDS.COMPLETED_MODULES]: completed,
    [PROGRESS_FIELDS.TOTAL_MODULES]: total,
    [PROGRESS_FIELDS.PERCENTAGE]: percentage,
  };

  return addDocument(COLLECTIONS.PROGRESS, payload);
};

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Retrieves all progress records from the "progress" collection.
 *
 * @param {Object} [options] - Optional ordering/pagination.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getAllProgress();
 */
export const getAllProgress = async (options = {}) => {
  return getAllDocuments(COLLECTIONS.PROGRESS, options);
};

/**
 * Retrieves a single progress record by its Firestore document ID.
 *
 * @param {string} progressId - Firestore document ID.
 * @returns {Promise<{ success: boolean, data?: Object, message: string }>}
 *
 * @example
 * const result = await getProgressById("prog_abc123");
 */
export const getProgressById = async (progressId) => {
  if (!progressId) return createNotFoundError("Progress");
  return getDocumentById(COLLECTIONS.PROGRESS, progressId);
};

/**
 * Retrieves all progress records for a specific student.
 *
 * @param {string} studentId - Firestore student document ID.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getProgressByStudent("STU_001");
 */
export const getProgressByStudent = async (studentId) => {
  if (!studentId) return createValidationError("Student ID is required.");
  return queryDocuments(COLLECTIONS.PROGRESS, [
    [PROGRESS_FIELDS.STUDENT_ID, "==", studentId],
  ]);
};

/**
 * Retrieves all progress records for a specific course.
 *
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getProgressByCourse("COURSE_001");
 */
export const getProgressByCourse = async (courseId) => {
  if (!courseId) return createValidationError("Course ID is required.");
  return queryDocuments(COLLECTIONS.PROGRESS, [
    [PROGRESS_FIELDS.COURSE_ID, "==", courseId],
  ]);
};

/**
 * Retrieves the progress record for a specific student in a specific course.
 * Returns the single matching record or a not-found error.
 *
 * @param {string} studentId - Firestore student document ID.
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: Object|null, message: string }>}
 *
 * @example
 * const result = await getProgressByStudentAndCourse("STU_001", "COURSE_001");
 */
export const getProgressByStudentAndCourse = async (studentId, courseId) => {
  if (!studentId || !courseId) {
    return createValidationError("Both Student ID and Course ID are required.");
  }

  const result = await queryDocuments(COLLECTIONS.PROGRESS, [
    [PROGRESS_FIELDS.STUDENT_ID, "==", studentId],
    [PROGRESS_FIELDS.COURSE_ID, "==", courseId],
  ]);

  if (!result.success) return result;
  if (result.data.length === 0) return createNotFoundError("Progress");

  return createSuccessResponse(result.data[0]);
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Updates a progress record. Recalculates percentage whenever
 * completedModules or totalModules changes.
 *
 * @param {string} progressId - Firestore document ID.
 * @param {Partial<{ completedModules: number, totalModules: number }>} updates
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateProgress("prog_abc123", { completedModules: 9 });
 */
export const updateProgress = async (progressId, updates) => {
  if (!progressId) return createNotFoundError("Progress");

  const sanitized = {};

  if (updates.completedModules !== undefined) {
    sanitized[PROGRESS_FIELDS.COMPLETED_MODULES] = Number(updates.completedModules);
  }
  if (updates.totalModules !== undefined) {
    sanitized[PROGRESS_FIELDS.TOTAL_MODULES] = Number(updates.totalModules);
  }

  // Recalculate percentage if either module count changed
  if (
    sanitized[PROGRESS_FIELDS.COMPLETED_MODULES] !== undefined ||
    sanitized[PROGRESS_FIELDS.TOTAL_MODULES] !== undefined
  ) {
    const existingResult = await getProgressById(progressId);
    if (!existingResult.success) return existingResult;

    const existing = existingResult.data;
    const completed =
      sanitized[PROGRESS_FIELDS.COMPLETED_MODULES] ?? existing.completedModules ?? 0;
    const total =
      sanitized[PROGRESS_FIELDS.TOTAL_MODULES] ?? existing.totalModules ?? 1;

    if (completed > total) {
      return createValidationError(
        "Completed modules cannot exceed total modules."
      );
    }

    sanitized[PROGRESS_FIELDS.PERCENTAGE] = _calcPercentage(completed, total);
  }

  return updateDocument(COLLECTIONS.PROGRESS, progressId, sanitized);
};

/**
 * Increments the completedModules count by 1 for a progress record.
 * Will not exceed totalModules. Automatically recalculates percentage.
 *
 * @param {string} progressId - Firestore document ID.
 * @returns {Promise<{ success: boolean, data?: { id: string, newPercentage: number }, message: string }>}
 *
 * @example
 * const result = await incrementCompletedModules("prog_abc123");
 */
export const incrementCompletedModules = async (progressId) => {
  if (!progressId) return createNotFoundError("Progress");

  const existingResult = await getProgressById(progressId);
  if (!existingResult.success) return existingResult;

  const { completedModules, totalModules } = existingResult.data;

  if (completedModules >= totalModules) {
    return createSuccessResponse(
      { id: progressId, newPercentage: 100 },
      "Course is already 100% complete."
    );
  }

  const newCompleted = completedModules + 1;
  const newPercentage = _calcPercentage(newCompleted, totalModules);

  const updateResult = await updateDocument(COLLECTIONS.PROGRESS, progressId, {
    [PROGRESS_FIELDS.COMPLETED_MODULES]: newCompleted,
    [PROGRESS_FIELDS.PERCENTAGE]: newPercentage,
  });

  if (!updateResult.success) return updateResult;
  return createSuccessResponse({ id: progressId, newPercentage }, updateResult.message);
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Deletes a progress record from Firestore by document ID.
 *
 * @param {string} progressId - Firestore document ID.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await deleteProgress("prog_abc123");
 */
export const deleteProgress = async (progressId) => {
  if (!progressId) return createNotFoundError("Progress");
  return deleteDocument(COLLECTIONS.PROGRESS, progressId);
};

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

/**
 * Calculates the overall course completion percentage for a student
 * across all their enrolled courses.
 *
 * @param {string} studentId - Firestore student document ID.
 * @returns {Promise<{ success: boolean, data?: { studentId: string, overallPercentage: number, courseCount: number, completedCourses: number, inProgressCourses: number }, message: string }>}
 *
 * @example
 * const result = await getStudentOverallCompletion("STU_001");
 * // result.data.overallPercentage → 73.5
 */
export const getStudentOverallCompletion = async (studentId) => {
  if (!studentId) return createValidationError("Student ID is required.");

  const result = await getProgressByStudent(studentId);
  if (!result.success) return result;

  const progressRecords = result.data;
  if (progressRecords.length === 0) {
    return createSuccessResponse({
      studentId,
      overallPercentage: 0,
      courseCount: 0,
      completedCourses: 0,
      inProgressCourses: 0,
    });
  }

  const totalPercentage = progressRecords.reduce(
    (sum, p) => sum + (p.percentage ?? 0),
    0
  );
  const overallPercentage = _round(totalPercentage / progressRecords.length);
  const completedCourses = progressRecords.filter((p) => p.percentage >= 100).length;
  const inProgressCourses = progressRecords.filter(
    (p) => p.percentage > 0 && p.percentage < 100
  ).length;

  return createSuccessResponse({
    studentId,
    overallPercentage,
    courseCount: progressRecords.length,
    completedCourses,
    inProgressCourses,
  });
};

/**
 * Retrieves completion statistics for all students enrolled in a course.
 *
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: { courseId: string, enrolledCount: number, averagePercentage: number, completedCount: number }, message: string }>}
 *
 * @example
 * const result = await getCourseCompletionStats("COURSE_001");
 */
export const getCourseCompletionStats = async (courseId) => {
  if (!courseId) return createValidationError("Course ID is required.");

  const result = await getProgressByCourse(courseId);
  if (!result.success) return result;

  const records = result.data;
  if (records.length === 0) {
    return createSuccessResponse({ courseId, enrolledCount: 0, averagePercentage: 0, completedCount: 0 });
  }

  const totalPercentage = records.reduce((sum, p) => sum + (p.percentage ?? 0), 0);
  const averagePercentage = _round(totalPercentage / records.length);
  const completedCount = records.filter((p) => p.percentage >= 100).length;

  return createSuccessResponse({
    courseId,
    enrolledCount: records.length,
    averagePercentage,
    completedCount,
  });
};

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

/**
 * Calculates a percentage value clamped between 0 and 100.
 *
 * @private
 * @param {number} completed - Number of completed modules.
 * @param {number} total - Total number of modules.
 * @returns {number} Percentage (0–100), rounded to 2 decimal places.
 */
const _calcPercentage = (completed, total) => {
  if (!total || total <= 0) return 0;
  return _round(Math.min(100, (completed / total) * 100));
};

/**
 * Rounds a number to 2 decimal places.
 *
 * @private
 * @param {number} value
 * @returns {number}
 */
const _round = (value) => Math.round(value * 100) / 100;
