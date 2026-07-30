/**
 * @file firestoreHelpers.js
 * @description Reusable Firestore CRUD Helper Functions
 * @module backend/database/firestoreHelpers
 *
 * Provides generic, collection-agnostic CRUD operations.
 * All service files (studentService, courseService, etc.) call these
 * helpers instead of writing duplicate Firestore logic.
 *
 * Every function returns a standardized response:
 *   { success: boolean, data?: any, message: string, code?: string }
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../firebase/firebase.js";
import { PAGINATION } from "../firebase/firebaseConstants.js";
import {
  resolveFirestoreError,
  createSuccessResponse,
  createNotFoundError,
} from "../errors/authErrors.js";

// ─────────────────────────────────────────────
// Internal Utilities
// ─────────────────────────────────────────────

/**
 * Attaches Firestore server timestamps to a data object.
 * Adds createdAt on insert; always updates updatedAt.
 *
 * @param {Object} data - The data object to augment.
 * @param {boolean} [isNew=true] - If true, also sets createdAt.
 * @returns {Object} Data object with timestamp fields added.
 */
const _withTimestamps = (data, isNew = true) => {
  const timestamped = { ...data, updatedAt: serverTimestamp() };
  if (isNew) timestamped.createdAt = serverTimestamp();
  return timestamped;
};

/**
 * Converts a Firestore DocumentSnapshot to a plain JS object.
 * Adds the Firestore document ID as the `id` field.
 *
 * @param {import("firebase/firestore").DocumentSnapshot} docSnap - Firestore doc snapshot.
 * @returns {Object|null} Plain JS object with `id` field, or null if not found.
 */
const _docToObject = (docSnap) => {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Converts a Firestore QuerySnapshot to an array of plain JS objects.
 *
 * @param {import("firebase/firestore").QuerySnapshot} snapshot - Firestore query snapshot.
 * @returns {Array<Object>} Array of plain objects with `id` fields.
 */
const _snapshotToArray = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

// ─────────────────────────────────────────────
// CREATE Operations
// ─────────────────────────────────────────────

/**
 * Adds a new document to a collection with an auto-generated Firestore ID.
 * Automatically attaches createdAt and updatedAt server timestamps.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {Object} data - Document data (without ID).
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await addDocument("students", { name: "Alice", email: "alice@edu.com" });
 */
export const addDocument = async (collectionName, data) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, _withTimestamps(data));
    return createSuccessResponse(
      { id: docRef.id },
      `Document added to "${collectionName}" successfully.`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

/**
 * Sets a document with a specific ID in a collection.
 * If the document exists, it will be overwritten entirely.
 * Automatically attaches createdAt and updatedAt timestamps.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {string} documentId - The document ID to set.
 * @param {Object} data - Full document data.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await setDocument("courses", "COURSE_001", { title: "Math 101" });
 */
export const setDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, _withTimestamps(data));
    return createSuccessResponse(
      { id: documentId },
      `Document "${documentId}" set in "${collectionName}".`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

// ─────────────────────────────────────────────
// READ Operations
// ─────────────────────────────────────────────

/**
 * Fetches a single document by its Firestore document ID.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {string} documentId - The document ID to fetch.
 * @returns {Promise<{ success: boolean, data?: Object, message: string }>}
 *
 * @example
 * const result = await getDocumentById("students", "abc123");
 */
export const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    const record = _docToObject(docSnap);
    if (!record) return createNotFoundError(collectionName);
    return createSuccessResponse(record);
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

/**
 * Fetches all documents from a collection.
 * Supports optional ordering and pagination.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {Object} [options] - Query options.
 * @param {string} [options.orderByField] - Field to order results by.
 * @param {"asc"|"desc"} [options.orderDirection="asc"] - Sort direction.
 * @param {number} [options.pageSize] - Max number of results to return.
 * @param {import("firebase/firestore").DocumentSnapshot} [options.lastDoc] - Cursor for pagination.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await getAllDocuments("students", { orderByField: "name", pageSize: 20 });
 */
export const getAllDocuments = async (collectionName, options = {}) => {
  try {
    const {
      orderByField,
      orderDirection = "asc",
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
      lastDoc,
    } = options;

    const colRef = collection(db, collectionName);
    const constraints = [];

    if (orderByField) constraints.push(orderBy(orderByField, orderDirection));
    if (pageSize) constraints.push(limit(pageSize));
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    return createSuccessResponse(_snapshotToArray(snapshot));
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

/**
 * Fetches documents matching one or more field conditions.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {Array<[string, import("firebase/firestore").WhereFilterOp, *]>} conditions
 *   Array of [fieldPath, operator, value] tuples. E.g. [["studentId", "==", "s01"]].
 * @param {Object} [options] - Optional orderBy, pageSize.
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message: string }>}
 *
 * @example
 * const result = await queryDocuments("grades", [["studentId", "==", "STU_001"]]);
 */
export const queryDocuments = async (collectionName, conditions = [], options = {}) => {
  try {
    const { orderByField, orderDirection = "asc", pageSize } = options;

    const colRef = collection(db, collectionName);
    const constraints = conditions.map(([field, op, val]) =>
      where(field, op, val)
    );

    if (orderByField) constraints.push(orderBy(orderByField, orderDirection));
    if (pageSize) constraints.push(limit(pageSize));

    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    return createSuccessResponse(_snapshotToArray(snapshot));
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

// ─────────────────────────────────────────────
// UPDATE Operations
// ─────────────────────────────────────────────

/**
 * Partially updates specific fields of an existing Firestore document.
 * Only provided fields are changed; others remain untouched.
 * Automatically updates the updatedAt timestamp.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {string} documentId - The document ID to update.
 * @param {Object} updates - Partial field updates.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await updateDocument("students", "abc123", { attendance: 95 });
 */
export const updateDocument = async (collectionName, documentId, updates) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return createSuccessResponse(
      { id: documentId },
      `Document "${documentId}" updated successfully.`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

// ─────────────────────────────────────────────
// DELETE Operations
// ─────────────────────────────────────────────

/**
 * Deletes a document from a Firestore collection by its ID.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {string} documentId - The document ID to delete.
 * @returns {Promise<{ success: boolean, data?: { id: string }, message: string }>}
 *
 * @example
 * const result = await deleteDocument("students", "abc123");
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return createSuccessResponse(
      { id: documentId },
      `Document "${documentId}" deleted successfully.`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

// ─────────────────────────────────────────────
// BATCH Operations
// ─────────────────────────────────────────────

/**
 * Performs a batch write of multiple set/update/delete operations atomically.
 * All operations succeed or all fail together.
 *
 * @param {Array<{ type: "set"|"update"|"delete", collectionName: string, documentId: string, data?: Object }>} operations
 *   Array of operation descriptors.
 * @returns {Promise<{ success: boolean, data?: { count: number }, message: string }>}
 *
 * @example
 * const result = await batchWrite([
 *   { type: "set", collectionName: "students", documentId: "s01", data: { name: "Bob" } },
 *   { type: "delete", collectionName: "grades", documentId: "g99" },
 * ]);
 */
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);

    operations.forEach(({ type, collectionName, documentId, data }) => {
      const docRef = doc(db, collectionName, documentId);
      if (type === "set") {
        batch.set(docRef, _withTimestamps(data));
      } else if (type === "update") {
        batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
      } else if (type === "delete") {
        batch.delete(docRef);
      }
    });

    await batch.commit();
    return createSuccessResponse(
      { count: operations.length },
      `Batch of ${operations.length} operations committed successfully.`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

/**
 * Bulk-inserts an array of documents into a collection using Firestore batch writes.
 * Automatically chunks into batches of 500 (Firestore's max per batch).
 * Each document gets an auto-generated ID and server timestamps.
 *
 * @param {string} collectionName - Target Firestore collection name.
 * @param {Array<Object>} documents - Array of document data objects.
 * @returns {Promise<{ success: boolean, data?: { count: number }, message: string }>}
 *
 * @example
 * const result = await bulkInsert("students", studentArray);
 */
export const bulkInsert = async (collectionName, documents) => {
  try {
    const BATCH_LIMIT = 500;
    let totalInserted = 0;

    for (let i = 0; i < documents.length; i += BATCH_LIMIT) {
      const chunk = documents.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);

      chunk.forEach((data) => {
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, _withTimestamps(data));
      });

      await batch.commit();
      totalInserted += chunk.length;
    }

    return createSuccessResponse(
      { count: totalInserted },
      `${totalInserted} documents inserted into "${collectionName}".`
    );
  } catch (error) {
    return resolveFirestoreError(error);
  }
};

/**
 * Checks whether a document with a given field value already exists.
 *
 * @param {string} collectionName - Firestore collection name.
 * @param {string} fieldName - Field to query.
 * @param {*} fieldValue - Value to match.
 * @returns {Promise<boolean>} True if a matching document exists.
 *
 * @example
 * const exists = await documentExists("students", "email", "alice@edu.com");
 */
export const documentExists = async (collectionName, fieldName, fieldValue) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, where(fieldName, "==", fieldValue), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────
// Re-export Timestamp utility
// ─────────────────────────────────────────────

export { serverTimestamp, Timestamp };
