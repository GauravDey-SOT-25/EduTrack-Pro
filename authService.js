/**
 * @file authService.js
 * @description Firebase Authentication Service
 * @module backend/auth/authService
 *
 * Single entry point for all authentication operations.
 * HTML pages MUST NOT import from firebase directly — use this service.
 *
 * Supports:
 *  - Email & Password Login
 *  - Logout
 *  - Persistent Login (LOCAL persistence)
 *  - Session Timeout (30-minute inactivity)
 *  - Authentication State Listener
 *  - Login Validation (pre-Firebase)
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "../firebase/firebase.js";
import { resolveAuthError, createSuccessResponse } from "../errors/authErrors.js";
import { validateLoginForm } from "./validators.js";
import {
  initializeSession,
  destroySession,
  isSessionActive,
  getStoredAuthUser,
} from "./sessionManager.js";

// ─────────────────────────────────────────────
// Auth State Listener
// ─────────────────────────────────────────────

/**
 * Subscribes to Firebase Authentication state changes.
 * Fires immediately with the current user (or null if signed out).
 *
 * Use this on every protected page to guard against unauthenticated access.
 *
 * @param {Function} callback - Receives the Firebase User object (or null).
 * @returns {Function} Unsubscribe function — call it to stop listening.
 *
 * @example
 * const unsubscribe = authStateListener((user) => {
 *   if (!user) window.location.href = "/login.html";
 * });
 */
export const authStateListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

/**
 * Authenticates a user with email and password.
 *
 * Workflow:
 *  1. Validates form inputs before hitting Firebase.
 *  2. Sets Firebase Auth persistence to LOCAL (survives tab closes).
 *  3. Signs in via Firebase.
 *  4. Initializes session (storage + inactivity timer).
 *
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @param {Function} [onSessionExpired] - Optional callback for inactivity timeout.
 *   Defaults to redirecting to /login.html.
 * @param {boolean} [rememberMe=true] - If false, uses session-only persistence.
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, code?: string, errors?: Object }>}
 *
 * @example
 * const result = await login("student@school.edu", "password123");
 * if (result.success) {
 *   console.log(result.data.user.email);
 * } else {
 *   console.error(result.message);
 * }
 */
export const login = async (
  email,
  password,
  onSessionExpired = null,
  rememberMe = true
) => {
  try {
    // Step 1: Pre-Firebase validation
    const validation = validateLoginForm({ email, password });
    if (!validation.valid) {
      return {
        success: false,
        code: "validation-error",
        message: "Please fix the form errors before submitting.",
        errors: validation.errors,
      };
    }

    // Step 2: Set persistence strategy
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;
    await setPersistence(auth, persistence);

    // Step 3: Firebase sign-in
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = userCredential.user;

    // Step 4: Initialize session with inactivity timer
    const expiredHandler =
      onSessionExpired ??
      (() => {
        destroySession();
        window.location.href = "/login.html";
      });

    initializeSession(user, expiredHandler);

    return createSuccessResponse(
      { user: _serializeUser(user) },
      "Login successful. Welcome back!"
    );
  } catch (error) {
    return resolveAuthError(error);
  }
};

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

/**
 * Signs out the current user and destroys the session.
 *
 * Workflow:
 *  1. Stops the inactivity timer.
 *  2. Clears all session storage.
 *  3. Calls Firebase signOut.
 *
 * @returns {Promise<{ success: boolean, message: string, code?: string }>}
 *
 * @example
 * const result = await logout();
 * if (result.success) window.location.href = "/login.html";
 */
export const logout = async () => {
  try {
    destroySession();
    await signOut(auth);
    return createSuccessResponse(null, "You have been successfully logged out.");
  } catch (error) {
    return resolveAuthError(error);
  }
};

// ─────────────────────────────────────────────
// Current User
// ─────────────────────────────────────────────

/**
 * Returns the currently authenticated Firebase user, or null.
 * Prefers the live Firebase auth state; falls back to stored session data.
 *
 * @returns {{ uid: string, email: string, displayName: string|null }|null}
 */
export const getCurrentUser = () => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) return _serializeUser(firebaseUser);
  return getStoredAuthUser();
};

/**
 * Returns true if a user is currently authenticated with an active session.
 *
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null && isSessionActive();
};

// ─────────────────────────────────────────────
// Protected Route Guard
// ─────────────────────────────────────────────

/**
 * Guards a page by redirecting unauthenticated users.
 * Call this at the top of every protected page's script.
 *
 * @param {string} [redirectPath="/login.html"] - Where to redirect if not authenticated.
 * @returns {Promise<{ uid: string, email: string }|null>} The current user or null.
 *
 * @example
 * // In dashboard.js (module script on a protected page)
 * const user = await requireAuth();
 * if (!user) return; // Already redirected
 */
export const requireAuth = (redirectPath = "/login.html") => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user || !isSessionActive()) {
        destroySession();
        window.location.href = redirectPath;
        resolve(null);
      } else {
        resolve(_serializeUser(user));
      }
    });
  });
};

// ─────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────

/**
 * Serializes a Firebase User object into a safe, plain object.
 * Strips Firebase internals and token data before returning to callers.
 *
 * @private
 * @param {import("firebase/auth").User} user - Raw Firebase user.
 * @returns {{ uid: string, email: string, displayName: string|null, photoURL: string|null, emailVerified: boolean }}
 */
const _serializeUser = (user) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName ?? null,
  photoURL: user.photoURL ?? null,
  emailVerified: user.emailVerified,
});
