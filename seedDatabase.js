/**
 * @file seedDatabase.js
 * @description Firestore Database Seeder
 * @module backend/database/seedDatabase
 *
 * Uploads all mock JSON data into Firestore using batched writes.
 * Run this script ONCE to populate your development/staging database.
 *
 * HOW TO USE:
 *   1. Open index.html (or any HTML file) in a browser.
 *   2. Import and call seedDatabase() from your browser console
 *      OR include a temporary <script type="module"> block that calls it.
 *   3. Check the browser console for progress and results.
 *   4. Remove or disable the seed call after the first successful run.
 *
 * SAFETY:
 *   - By default, seedDatabase() will SKIP collections that already
 *     have documents. Pass { force: true } to overwrite.
 *   - Uses Firestore batch writes (500-doc chunks) for efficiency.
 *   - Never call this in production with real user data.
 *
 * @example
 * // In browser console or a temporary script:
 * import { seedDatabase } from "./backend/database/seedDatabase.js";
 * const result = await seedDatabase();
 * console.log(result);
 */

import { collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../firebase/firebase.js";
import { COLLECTIONS } from "../firebase/firebaseConstants.js";
import { bulkInsert } from "./firestoreHelpers.js";

// ─────────────────────────────────────────────
// JSON Data Imports (via fetch, since ES Modules
// cannot import JSON directly in the browser without
// an import assertion or bundler)
// ─────────────────────────────────────────────

/**
 * Fetches and parses a JSON file relative to this module's base URL.
 *
 * @param {string} relativePath - Path relative to the project root.
 * @returns {Promise<Array|Object>} Parsed JSON data.
 * @throws Will throw if fetch fails or JSON is invalid.
 */
const _loadJSON = async (relativePath) => {
  const response = await fetch(relativePath);
  if (!response.ok) {
    throw new Error(
      `Failed to load JSON: ${relativePath} (HTTP ${response.status})`
    );
  }
  return response.json();
};

// ─────────────────────────────────────────────
// Collection Existence Check
// ─────────────────────────────────────────────

/**
 * Checks whether a Firestore collection already contains documents.
 * Used to skip seeding already-populated collections.
 *
 * @param {string} collectionName - Firestore collection name.
 * @returns {Promise<boolean>} True if the collection has at least 1 document.
 */
const _collectionHasData = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ─────────────────────────────────────────────
// Individual Collection Seeders
// ─────────────────────────────────────────────

/**
 * Seeds the "students" Firestore collection from students.json.
 *
 * @param {boolean} force - If true, seeds even if documents already exist.
 * @returns {Promise<{ collection: string, seeded: boolean, count: number, message: string }>}
 */
const _seedStudents = async (force) => {
  const hasData = await _collectionHasData(COLLECTIONS.STUDENTS);
  if (hasData && !force) {
    return {
      collection: COLLECTIONS.STUDENTS,
      seeded: false,
      count: 0,
      message: "Skipped — collection already has data. Use force:true to overwrite.",
    };
  }

  const students = await _loadJSON("./backend/mockData/students.json");
  const result = await bulkInsert(COLLECTIONS.STUDENTS, students);

  return {
    collection: COLLECTIONS.STUDENTS,
    seeded: result.success,
    count: result.success ? result.data.count : 0,
    message: result.message,
  };
};

/**
 * Seeds the "courses" Firestore collection from courses.json.
 *
 * @param {boolean} force - If true, seeds even if documents already exist.
 * @returns {Promise<{ collection: string, seeded: boolean, count: number, message: string }>}
 */
const _seedCourses = async (force) => {
  const hasData = await _collectionHasData(COLLECTIONS.COURSES);
  if (hasData && !force) {
    return {
      collection: COLLECTIONS.COURSES,
      seeded: false,
      count: 0,
      message: "Skipped — collection already has data. Use force:true to overwrite.",
    };
  }

  const courses = await _loadJSON("./backend/mockData/courses.json");
  const result = await bulkInsert(COLLECTIONS.COURSES, courses);

  return {
    collection: COLLECTIONS.COURSES,
    seeded: result.success,
    count: result.success ? result.data.count : 0,
    message: result.message,
  };
};

/**
 * Seeds the "grades" Firestore collection from grades.json.
 *
 * @param {boolean} force - If true, seeds even if documents already exist.
 * @returns {Promise<{ collection: string, seeded: boolean, count: number, message: string }>}
 */
const _seedGrades = async (force) => {
  const hasData = await _collectionHasData(COLLECTIONS.GRADES);
  if (hasData && !force) {
    return {
      collection: COLLECTIONS.GRADES,
      seeded: false,
      count: 0,
      message: "Skipped — collection already has data. Use force:true to overwrite.",
    };
  }

  const grades = await _loadJSON("./backend/mockData/grades.json");
  const result = await bulkInsert(COLLECTIONS.GRADES, grades);

  return {
    collection: COLLECTIONS.GRADES,
    seeded: result.success,
    count: result.success ? result.data.count : 0,
    message: result.message,
  };
};

/**
 * Seeds the "progress" Firestore collection from progress.json.
 *
 * @param {boolean} force - If true, seeds even if documents already exist.
 * @returns {Promise<{ collection: string, seeded: boolean, count: number, message: string }>}
 */
const _seedProgress = async (force) => {
  const hasData = await _collectionHasData(COLLECTIONS.PROGRESS);
  if (hasData && !force) {
    return {
      collection: COLLECTIONS.PROGRESS,
      seeded: false,
      count: 0,
      message: "Skipped — collection already has data. Use force:true to overwrite.",
    };
  }

  const progress = await _loadJSON("./backend/mockData/progress.json");
  const result = await bulkInsert(COLLECTIONS.PROGRESS, progress);

  return {
    collection: COLLECTIONS.PROGRESS,
    seeded: result.success,
    count: result.success ? result.data.count : 0,
    message: result.message,
  };
};

// ─────────────────────────────────────────────
// Main Seeder Entry Point
// ─────────────────────────────────────────────

/**
 * Orchestrates seeding of all four Firestore collections.
 * Runs sequentially to avoid overwhelming Firestore quotas.
 *
 * @param {Object} [options={}] - Seeder configuration.
 * @param {boolean} [options.force=false] - If true, seeds even if data exists.
 * @param {boolean} [options.verbose=true] - If true, logs progress to the console.
 * @returns {Promise<{
 *   success: boolean,
 *   summary: Array<{ collection: string, seeded: boolean, count: number, message: string }>,
 *   totalSeeded: number,
 *   errors: string[]
 * }>}
 *
 * @example
 * // Seed only if collections are empty
 * const result = await seedDatabase();
 *
 * @example
 * // Force re-seed all collections
 * const result = await seedDatabase({ force: true });
 */
export const seedDatabase = async (options = {}) => {
  const { force = false, verbose = true } = options;

  const log = (msg) => {
    if (verbose) console.log(`[EduTrack Seeder] ${msg}`);
  };

  log("Starting database seed operation...");
  log(`Mode: ${force ? "FORCE (overwriting existing data)" : "SAFE (skipping populated collections)"}`);

  const errors = [];
  const summary = [];

  // ── Seed Students ──────────────────────────
  try {
    log("Seeding students...");
    const result = await _seedStudents(force);
    summary.push(result);
    log(`Students: ${result.message}`);
  } catch (err) {
    const msg = `Students seeding failed: ${err.message}`;
    errors.push(msg);
    log(`ERROR — ${msg}`);
    summary.push({ collection: COLLECTIONS.STUDENTS, seeded: false, count: 0, message: msg });
  }

  // ── Seed Courses ───────────────────────────
  try {
    log("Seeding courses...");
    const result = await _seedCourses(force);
    summary.push(result);
    log(`Courses: ${result.message}`);
  } catch (err) {
    const msg = `Courses seeding failed: ${err.message}`;
    errors.push(msg);
    log(`ERROR — ${msg}`);
    summary.push({ collection: COLLECTIONS.COURSES, seeded: false, count: 0, message: msg });
  }

  // ── Seed Grades ────────────────────────────
  try {
    log("Seeding grades...");
    const result = await _seedGrades(force);
    summary.push(result);
    log(`Grades: ${result.message}`);
  } catch (err) {
    const msg = `Grades seeding failed: ${err.message}`;
    errors.push(msg);
    log(`ERROR — ${msg}`);
    summary.push({ collection: COLLECTIONS.GRADES, seeded: false, count: 0, message: msg });
  }

  // ── Seed Progress ──────────────────────────
  try {
    log("Seeding progress...");
    const result = await _seedProgress(force);
    summary.push(result);
    log(`Progress: ${result.message}`);
  } catch (err) {
    const msg = `Progress seeding failed: ${err.message}`;
    errors.push(msg);
    log(`ERROR — ${msg}`);
    summary.push({ collection: COLLECTIONS.PROGRESS, seeded: false, count: 0, message: msg });
  }

  // ── Final Report ───────────────────────────
  const totalSeeded = summary.reduce((sum, s) => sum + s.count, 0);
  const success = errors.length === 0;

  log("─────────────────────────────────────");
  log(`Seeding complete. Total documents inserted: ${totalSeeded}`);
  if (errors.length > 0) {
    log(`Errors encountered: ${errors.length}`);
    errors.forEach((e) => log(`  ✗ ${e}`));
  } else {
    log("All collections seeded successfully.");
  }
  log("─────────────────────────────────────");

  return { success, summary, totalSeeded, errors };
};

/**
 * Convenience function to seed a single collection by name.
 *
 * @param {"students"|"courses"|"grades"|"progress"} collectionName
 * @param {boolean} [force=false] - Overwrite existing data if true.
 * @returns {Promise<{ collection: string, seeded: boolean, count: number, message: string }>}
 *
 * @example
 * const result = await seedCollection("grades", true);
 */
export const seedCollection = async (collectionName, force = false) => {
  switch (collectionName) {
    case COLLECTIONS.STUDENTS:
      return _seedStudents(force);
    case COLLECTIONS.COURSES:
      return _seedCourses(force);
    case COLLECTIONS.GRADES:
      return _seedGrades(force);
    case COLLECTIONS.PROGRESS:
      return _seedProgress(force);
    default:
      return {
        collection: collectionName,
        seeded: false,
        count: 0,
        message: `Unknown collection: "${collectionName}". Valid: students, courses, grades, progress.`,
      };
  }
};
