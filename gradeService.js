/**
 * @file gradeService.js
 * @description Grades API — Firestore CRUD for the "grades" Collection
 * @module backend/api/gradeService
 *
 * All operations are routed through firestoreHelpers.js.
 * HTML pages must never call Firestore directly — use this service.
 *
 * Grade fields: quiz (0-100), assignment (0-100), midterm (0-100),
 *               final (0-100), attendance (0-100).
 *
 * Available Methods:
 *  - createGrade(data)
 *  - getAllGrades(options?)
 *  - getGradeById(gradeId)
 *  - getGradesByStudent(studentId)
 *  - getGradesByCourse(courseId)
 *  - getGradeByStudentAndCourse(studentId, courseId)
 *  - updateGrade(gradeId, updates)
 *  - deleteGrade(gradeId)
 *  - calculateAverageGrade(studentId)
 */

import { COLLECTIONS, GRADE_FIELDS } from "../firebase/firebaseConstants.js";
import {
  addDocument,
  getDocumentById,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument,
} from "../database/firestoreHelpers.js";
import { validateGradeForm } from "../auth/validators.js";
import {
  createValidationError,
  createSuccessResponse,
  createNotFoundError,
} from "../errors/authErrors.js";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Creates a new grade record in the "grades" Firestore collection.
 * All numeric grade fields must be between 0 and 100.
 *
 * @param {{ studentId: string, courseId: string, quiz: number, assignment: number, midterm: number, final: number, attendance: number }} gradeData
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await createGrade({
 *   studentId: "STU_001",
 *   courseId: "COURSE_001",
 *   quiz: 88,
 *   assignment: 92,
 *   midterm: 79,
 *   final: 85,
 *   attendance: 95,
 * });
 */
export const createGrade = async (gradeData) => {
  const validation = validateGradeForm(gradeData);
  if (!validation.valid) {
    return createValidationError("Grade data is invalid.", validation.errors);
  }

  const payload = {
    [GRADE_FIELDS.STUDENT_ID]: gradeData.studentId.trim(),
    [GRADE_FIELDS.COURSE_ID]: gradeData.courseId.trim(),
    [GRADE_FIELDS.QUIZ]: Number(gradeData.quiz),
    [GRADE_FIELDS.ASSIGNMENT]: Number(gradeData.assignment),
    [GRADE_FIELDS.MIDTERM]: Number(gradeData.midterm),
    [GRADE_FIELDS.FINAL]: Number(gradeData.final),
    [GRADE_FIELDS.ATTENDANCE]: Number(gradeData.attendance),
  };

  return addDocument(COLLECTIONS.GRADES, payload);
};

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Retrieves all grade records from the "grades" collection.
 *
 * @param {Object} [options] - Optional ordering/pagination.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getAllGrades();
 */
export const getAllGrades = async (options = {}) => {
  return getAllDocuments(COLLECTIONS.GRADES, options);
};

/**
 * Retrieves a single grade record by its Firestore document ID.
 *
 * @param {string} gradeId - Firestore document ID.
 * @returns {Promise<{ success: boolean, data?: Object, message: string }>}
 *
 * @example
 * const result = await getGradeById("grade_abc123");
 */
export const getGradeById = async (gradeId) => {
  if (!gradeId) return createNotFoundError("Grade");
  return getDocumentById(COLLECTIONS.GRADES, gradeId);
};

/**
 * Retrieves all grade records belonging to a specific student.
 *
 * @param {string} studentId - Firestore student document ID.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getGradesByStudent("STU_001");
 */
export const getGradesByStudent = async (studentId) => {
  if (!studentId) return createValidationError("Student ID is required.");
  return queryDocuments(COLLECTIONS.GRADES, [
    [GRADE_FIELDS.STUDENT_ID, "==", studentId],
  ]);
};

/**
 * Retrieves all grade records for a specific course.
 *
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getGradesByCourse("COURSE_001");
 */
export const getGradesByCourse = async (courseId) => {
  if (!courseId) return createValidationError("Course ID is required.");
  return queryDocuments(COLLECTIONS.GRADES, [
    [GRADE_FIELDS.COURSE_ID, "==", courseId],
  ]);
};

/**
 * Retrieves the grade record for a specific student in a specific course.
 *
 * @param {string} studentId - Firestore student document ID.
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: Object|null, message: string }>}
 *
 * @example
 * const result = await getGradeByStudentAndCourse("STU_001", "COURSE_001");
 */
export const getGradeByStudentAndCourse = async (studentId, courseId) => {
  if (!studentId || !courseId) {
    return createValidationError("Both Student ID and Course ID are required.");
  }

  const result = await queryDocuments(COLLECTIONS.GRADES, [
    [GRADE_FIELDS.STUDENT_ID, "==", studentId],
    [GRADE_FIELDS.COURSE_ID, "==", courseId],
  ]);

  if (!result.success) return result;
  if (result.data.length === 0) return createNotFoundError("Grade");

  return createSuccessResponse(result.data[0]);
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Updates specific grade fields for an existing grade record.
 * All numeric fields must remain between 0 and 100.
 *
 * @param {string} gradeId - Firestore document ID of the grade record.
 * @param {Partial<{ quiz: number, assignment: number, midterm: number, final: number, attendance: number }>} updates
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateGrade("grade_abc123", { final: 91, attendance: 98 });
 */
export const updateGrade = async (gradeId, updates) => {
  if (!gradeId) return createNotFoundError("Grade");

  const sanitized = {};
  const numericFields = ["quiz", "assignment", "midterm", "final", "attendance"];

  for (const field of numericFields) {
    if (updates[field] !== undefined) {
      const val = Number(updates[field]);
      if (isNaN(val) || val < 0 || val > 100) {
        return createValidationError(`${field} must be a number between 0 and 100.`);
      }
      sanitized[field] = val;
    }
  }

  return updateDocument(COLLECTIONS.GRADES, gradeId, sanitized);
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Deletes a grade record from Firestore by document ID.
 *
 * @param {string} gradeId - Firestore document ID of the grade to delete.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await deleteGrade("grade_abc123");
 */
export const deleteGrade = async (gradeId) => {
  if (!gradeId) return createNotFoundError("Grade");
  return deleteDocument(COLLECTIONS.GRADES, gradeId);
};

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

/**
 * Calculates the weighted average grade for a student across all their courses.
 * Weight distribution: Quiz 15%, Assignment 25%, Midterm 25%, Final 35%.
 *
 * @param {string} studentId - Firestore student document ID.
 * @returns {Promise<{ success: boolean, data?: { studentId: string, averageGrade: number, gradeCount: number, breakdown: Object }, message: string }>}
 *
 * @example
 * const result = await calculateAverageGrade("STU_001");
 * // result.data.averageGrade → 87.4
 */
export const calculateAverageGrade = async (studentId) => {
  if (!studentId) return createValidationError("Student ID is required.");

  const result = await getGradesByStudent(studentId);
  if (!result.success) return result;

  const grades = result.data;
  if (grades.length === 0) {
    return createSuccessResponse({
      studentId,
      averageGrade: 0,
      gradeCount: 0,
      breakdown: { quiz: 0, assignment: 0, midterm: 0, final: 0, attendance: 0 },
    });
  }

  const weights = { quiz: 0.15, assignment: 0.25, midterm: 0.25, final: 0.35 };

  const totals = grades.reduce(
    (acc, g) => ({
      quiz: acc.quiz + (g.quiz ?? 0),
      assignment: acc.assignment + (g.assignment ?? 0),
      midterm: acc.midterm + (g.midterm ?? 0),
      final: acc.final + (g.final ?? 0),
      attendance: acc.attendance + (g.attendance ?? 0),
    }),
    { quiz: 0, assignment: 0, midterm: 0, final: 0, attendance: 0 }
  );

  const count = grades.length;
  const breakdown = {
    quiz: _round(totals.quiz / count),
    assignment: _round(totals.assignment / count),
    midterm: _round(totals.midterm / count),
    final: _round(totals.final / count),
    attendance: _round(totals.attendance / count),
  };

  const averageGrade = _round(
    breakdown.quiz * weights.quiz +
    breakdown.assignment * weights.assignment +
    breakdown.midterm * weights.midterm +
    breakdown.final * weights.final
  );

  return createSuccessResponse({ studentId, averageGrade, gradeCount: count, breakdown });
};

/**
 * Calculates aggregate class statistics for a specific course.
 *
 * @param {string} courseId - Firestore course document ID.
 * @returns {Promise<{ success: boolean, data?: { courseId: string, studentCount: number, averages: Object, highest: Object, lowest: Object }, message: string }>}
 *
 * @example
 * const result = await getCourseGradeStats("COURSE_001");
 */
export const getCourseGradeStats = async (courseId) => {
  if (!courseId) return createValidationError("Course ID is required.");

  const result = await getGradesByCourse(courseId);
  if (!result.success) return result;

  const grades = result.data;
  if (grades.length === 0) {
    return createSuccessResponse({ courseId, studentCount: 0, averages: {}, highest: {}, lowest: {} });
  }

  const fields = ["quiz", "assignment", "midterm", "final", "attendance"];
  const averages = {};
  const highest = {};
  const lowest = {};

  fields.forEach((field) => {
    const values = grades.map((g) => g[field] ?? 0);
    averages[field] = _round(values.reduce((a, b) => a + b, 0) / values.length);
    highest[field] = Math.max(...values);
    lowest[field] = Math.min(...values);
  });

  return createSuccessResponse({
    courseId,
    studentCount: grades.length,
    averages,
    highest,
    lowest,
  });
};

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

/**
 * Rounds a number to 2 decimal places.
 *
 * @private
 * @param {number} value
 * @returns {number}
 */
const _round = (value) => Math.round(value * 100) / 100;
