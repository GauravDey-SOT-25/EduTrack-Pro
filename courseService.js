/**
 * @file courseService.js
 * @description Course API — Firestore CRUD for the "courses" Collection
 * @module backend/api/courseService
 *
 * All operations are routed through firestoreHelpers.js.
 * HTML pages must never call Firestore directly — use this service.
 *
 * Available Methods:
 *  - createCourse(data)
 *  - getAllCourses(options?)
 *  - getCourseById(courseId)
 *  - getCoursesByStatus(status)
 *  - getCoursesByInstructor(instructor)
 *  - updateCourse(courseId, updates)
 *  - updateCourseStatus(courseId, status)
 *  - deleteCourse(courseId)
 */

import {
  COLLECTIONS,
  COURSE_FIELDS,
  COURSE_STATUS,
} from "../firebase/firebaseConstants.js";
import {
  addDocument,
  getDocumentById,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument,
} from "../database/firestoreHelpers.js";
import { validateRequired } from "../auth/validators.js";
import {
  createValidationError,
  createSuccessResponse,
  createNotFoundError,
} from "../errors/authErrors.js";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Creates a new course record in the "courses" Firestore collection.
 *
 * @param {{ title: string, description: string, instructor: string, thumbnail?: string, totalModules: number, status?: string }} courseData
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await createCourse({
 *   title: "Advanced JavaScript",
 *   description: "Deep dive into JS patterns and async programming.",
 *   instructor: "Dr. Sarah Lee",
 *   totalModules: 12,
 *   status: "active",
 * });
 */
export const createCourse = async (courseData) => {
  const errors = {};

  const titleCheck = validateRequired(courseData.title, "Title");
  if (!titleCheck.valid) errors.title = titleCheck.error;

  const descCheck = validateRequired(courseData.description, "Description");
  if (!descCheck.valid) errors.description = descCheck.error;

  const instructorCheck = validateRequired(courseData.instructor, "Instructor");
  if (!instructorCheck.valid) errors.instructor = instructorCheck.error;

  if (Object.keys(errors).length > 0) {
    return createValidationError("Course data is invalid.", errors);
  }

  const validStatuses = Object.values(COURSE_STATUS);
  const status = validStatuses.includes(courseData.status)
    ? courseData.status
    : COURSE_STATUS.ACTIVE;

  const payload = {
    [COURSE_FIELDS.TITLE]: courseData.title.trim(),
    [COURSE_FIELDS.DESCRIPTION]: courseData.description.trim(),
    [COURSE_FIELDS.INSTRUCTOR]: courseData.instructor.trim(),
    [COURSE_FIELDS.THUMBNAIL]: courseData.thumbnail ?? _generateThumbnailUrl(courseData.title),
    [COURSE_FIELDS.TOTAL_MODULES]: Number(courseData.totalModules) || 0,
    [COURSE_FIELDS.COMPLETED_MODULES]: Number(courseData.completedModules) || 0,
    [COURSE_FIELDS.STATUS]: status,
  };

  return addDocument(COLLECTIONS.COURSES, payload);
};

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Retrieves all courses, ordered by title ascending by default.
 *
 * @param {Object} [options] - Optional pagination/ordering config.
 * @param {string} [options.orderByField="title"] - Field to sort by.
 * @param {"asc"|"desc"} [options.orderDirection="asc"] - Sort direction.
 * @param {number} [options.pageSize=20] - Max results.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getAllCourses({ pageSize: 100 });
 */
export const getAllCourses = async (options = {}) => {
  const defaults = {
    orderByField: COURSE_FIELDS.TITLE,
    orderDirection: "asc",
    ...options,
  };
  return getAllDocuments(COLLECTIONS.COURSES, defaults);
};

/**
 * Retrieves a single course record by its Firestore document ID.
 *
 * @param {string} courseId - Firestore document ID of the course.
 * @returns {Promise<{ success: boolean, data?: Object, message: string }>}
 *
 * @example
 * const result = await getCourseById("COURSE_001");
 */
export const getCourseById = async (courseId) => {
  if (!courseId) return createNotFoundError("Course");
  return getDocumentById(COLLECTIONS.COURSES, courseId);
};

/**
 * Retrieves all courses matching a specific status.
 *
 * @param {"active"|"completed"|"archived"|"draft"} status - Course status filter.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getCoursesByStatus("active");
 */
export const getCoursesByStatus = async (status) => {
  const validStatuses = Object.values(COURSE_STATUS);
  if (!validStatuses.includes(status)) {
    return createValidationError(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
    );
  }
  return queryDocuments(COLLECTIONS.COURSES, [
    [COURSE_FIELDS.STATUS, "==", status],
  ]);
};

/**
 * Retrieves all courses taught by a specific instructor.
 *
 * @param {string} instructor - Instructor's name to filter by.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getCoursesByInstructor("Dr. Sarah Lee");
 */
export const getCoursesByInstructor = async (instructor) => {
  if (!instructor?.trim()) {
    return createValidationError("Instructor name is required.");
  }
  return queryDocuments(COLLECTIONS.COURSES, [
    [COURSE_FIELDS.INSTRUCTOR, "==", instructor.trim()],
  ]);
};

/**
 * Retrieves a course record with aggregated student enrollment count.
 * Counts how many students have a progress record linked to this course.
 *
 * @param {string} courseId - Firestore document ID of the course.
 * @returns {Promise<{ success: boolean, data?: { course: Object, enrolledStudents: number }, message: string }>}
 *
 * @example
 * const result = await getCourseWithStats("COURSE_001");
 */
export const getCourseWithStats = async (courseId) => {
  const [courseResult, progressResult] = await Promise.all([
    getDocumentById(COLLECTIONS.COURSES, courseId),
    queryDocuments(COLLECTIONS.PROGRESS, [
      [COURSE_FIELDS.COURSE_ID, "==", courseId],
    ]),
  ]);

  if (!courseResult.success) return courseResult;

  return createSuccessResponse({
    course: courseResult.data,
    enrolledStudents: progressResult.success ? progressResult.data.length : 0,
  });
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Updates specific fields of a course record.
 * Only provided fields are changed; others remain untouched.
 *
 * @param {string} courseId - Firestore document ID of the course.
 * @param {Partial<{ title: string, description: string, instructor: string, thumbnail: string, totalModules: number, completedModules: number, status: string }>} updates
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateCourse("COURSE_001", { status: "completed" });
 */
export const updateCourse = async (courseId, updates) => {
  if (!courseId) return createNotFoundError("Course");

  const sanitized = {};
  if (updates.title !== undefined) sanitized[COURSE_FIELDS.TITLE] = updates.title.trim();
  if (updates.description !== undefined) sanitized[COURSE_FIELDS.DESCRIPTION] = updates.description.trim();
  if (updates.instructor !== undefined) sanitized[COURSE_FIELDS.INSTRUCTOR] = updates.instructor.trim();
  if (updates.thumbnail !== undefined) sanitized[COURSE_FIELDS.THUMBNAIL] = updates.thumbnail;
  if (updates.totalModules !== undefined) sanitized[COURSE_FIELDS.TOTAL_MODULES] = Number(updates.totalModules);
  if (updates.completedModules !== undefined)
    sanitized[COURSE_FIELDS.COMPLETED_MODULES] = Number(updates.completedModules);
  if (updates.status !== undefined) {
    const validStatuses = Object.values(COURSE_STATUS);
    if (!validStatuses.includes(updates.status)) {
      return createValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
      );
    }
    sanitized[COURSE_FIELDS.STATUS] = updates.status;
  }

  return updateDocument(COLLECTIONS.COURSES, courseId, sanitized);
};

/**
 * Updates only the status field of a course record.
 * Convenience wrapper around updateCourse for status-only changes.
 *
 * @param {string} courseId - Firestore document ID.
 * @param {"active"|"completed"|"archived"|"draft"} status - New status value.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateCourseStatus("COURSE_001", "archived");
 */
export const updateCourseStatus = async (courseId, status) => {
  return updateCourse(courseId, { status });
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Deletes a course record from Firestore by document ID.
 *
 * @param {string} courseId - Firestore document ID of the course.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await deleteCourse("COURSE_001");
 */
export const deleteCourse = async (courseId) => {
  if (!courseId) return createNotFoundError("Course");
  return deleteDocument(COLLECTIONS.COURSES, courseId);
};

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

/**
 * Generates a deterministic placeholder thumbnail URL for a course.
 *
 * @private
 * @param {string} title - Course title used for placeholder text.
 * @returns {string} Thumbnail image URL.
 */
const _generateThumbnailUrl = (title) => {
  const encoded = encodeURIComponent(title?.trim() ?? "Course");
  return `https://ui-avatars.com/api/?name=${encoded}&background=0f172a&color=6366f1&size=256&bold=true&length=2`;
};
