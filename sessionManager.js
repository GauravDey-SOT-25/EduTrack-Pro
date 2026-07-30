/**
 * @file sessionManager.js
 * @description User Session Lifecycle & Inactivity Timeout Management
 * @module backend/auth/sessionManager
 *
 * Manages login timestamps, last-activity tracking, and auto-logout
 * after 30 minutes of inactivity. Listens to mouse, keyboard, and
 * touch events to reset the inactivity timer.
 *
 * Storage Strategy:
 *  - LocalStorage  → persists across browser tabs/restarts
 *  - SessionStorage → scoped to current browser tab
 */

import { STORAGE_KEYS, SESSION_CONFIG } from "../firebase/firebaseConstants.js";

// ─────────────────────────────────────────────
// Internal State
// ─────────────────────────────────────────────

/** @type {number|null} Interval ID for the inactivity checker. */
let _inactivityCheckInterval = null;

/** @type {Function|null} Callback invoked when the session expires. */
let _onSessionExpiredCallback = null;

// ─────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────

/**
 * Writes a value to both LocalStorage and SessionStorage.
 *
 * @param {string} key - Storage key constant from STORAGE_KEYS.
 * @param {string} value - Serialized string value.
 */
const _setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  } catch {
    // Storage quota exceeded or private browsing restrictions
  }
};

/**
 * Reads a value preferring LocalStorage, falling back to SessionStorage.
 *
 * @param {string} key - Storage key constant from STORAGE_KEYS.
 * @returns {string|null}
 */
const _getStorageItem = (key) => {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
};

/**
 * Removes a key from both LocalStorage and SessionStorage.
 *
 * @param {string} key - Storage key constant from STORAGE_KEYS.
 */
const _removeStorageItem = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

// ─────────────────────────────────────────────
// Session Write Operations
// ─────────────────────────────────────────────

/**
 * Persists the authenticated user object to storage.
 * Only stores safe, non-sensitive fields.
 *
 * @param {import("firebase/auth").User} user - Firebase Auth user object.
 */
export const storeAuthUser = (user) => {
  const safeUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    emailVerified: user.emailVerified,
  };
  _setStorageItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(safeUser));
};

/**
 * Records the exact login timestamp in storage.
 */
export const storeLoginTimestamp = () => {
  _setStorageItem(STORAGE_KEYS.LOGIN_TIMESTAMP, Date.now().toString());
};

/**
 * Updates the last-activity timestamp to right now.
 * Called by the inactivity event listeners.
 */
export const updateLastActivity = () => {
  _setStorageItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
};

/**
 * Marks the session as active in storage.
 */
export const markSessionActive = () => {
  _setStorageItem(STORAGE_KEYS.SESSION_ACTIVE, "true");
};

// ─────────────────────────────────────────────
// Session Read Operations
// ─────────────────────────────────────────────

/**
 * Retrieves the stored authenticated user object.
 *
 * @returns {{ uid: string, email: string, displayName: string|null, photoURL: string|null, emailVerified: boolean }|null}
 */
export const getStoredAuthUser = () => {
  const raw = _getStorageItem(STORAGE_KEYS.AUTH_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Retrieves the stored login timestamp as a Date object.
 *
 * @returns {Date|null}
 */
export const getLoginTimestamp = () => {
  const raw = _getStorageItem(STORAGE_KEYS.LOGIN_TIMESTAMP);
  if (!raw) return null;
  return new Date(Number(raw));
};

/**
 * Retrieves the last-activity timestamp as a Date object.
 *
 * @returns {Date|null}
 */
export const getLastActivityTimestamp = () => {
  const raw = _getStorageItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!raw) return null;
  return new Date(Number(raw));
};

/**
 * Returns true if a session is currently marked as active in storage.
 *
 * @returns {boolean}
 */
export const isSessionActive = () => {
  return _getStorageItem(STORAGE_KEYS.SESSION_ACTIVE) === "true";
};

/**
 * Returns how many milliseconds remain before the session expires.
 * Returns 0 if the session has already expired.
 *
 * @returns {number} Milliseconds remaining.
 */
export const getSessionTimeRemaining = () => {
  const lastActivity = getLastActivityTimestamp();
  if (!lastActivity) return 0;
  const elapsed = Date.now() - lastActivity.getTime();
  const remaining = SESSION_CONFIG.TIMEOUT_DURATION - elapsed;
  return Math.max(0, remaining);
};

// ─────────────────────────────────────────────
// Session Clear Operations
// ─────────────────────────────────────────────

/**
 * Removes all session-related keys from both storages.
 * Called on logout or session expiry.
 */
export const clearSession = () => {
  Object.values(STORAGE_KEYS).forEach(_removeStorageItem);
};

// ─────────────────────────────────────────────
// Inactivity Timer
// ─────────────────────────────────────────────

/**
 * Checks whether the session has exceeded the inactivity timeout.
 * If expired, clears the session, removes listeners, and triggers the callback.
 *
 * @private
 */
const _checkInactivity = () => {
  if (!isSessionActive()) return;

  const lastActivity = getLastActivityTimestamp();
  if (!lastActivity) return;

  const elapsed = Date.now() - lastActivity.getTime();

  if (elapsed >= SESSION_CONFIG.TIMEOUT_DURATION) {
    stopSessionTimer();
    clearSession();

    if (typeof _onSessionExpiredCallback === "function") {
      _onSessionExpiredCallback();
    }
  }
};

/**
 * Handles any user interaction event by refreshing the last-activity timestamp.
 *
 * @private
 */
const _handleUserActivity = () => {
  updateLastActivity();
};

// ─────────────────────────────────────────────
// Public Session Timer Controls
// ─────────────────────────────────────────────

/**
 * Starts the session inactivity timer and attaches DOM activity listeners.
 * Must be called after a successful login.
 *
 * @param {Function} onSessionExpired - Callback triggered when the session times out.
 *   Typically calls authService.logout() and redirects to the login page.
 *
 * @example
 * startSessionTimer(() => {
 *   authService.logout();
 *   window.location.href = "/login.html";
 * });
 */
export const startSessionTimer = (onSessionExpired) => {
  _onSessionExpiredCallback = onSessionExpired;

  // Initialize activity timestamps
  updateLastActivity();
  markSessionActive();

  // Attach interaction event listeners
  const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
  events.forEach((event) =>
    document.addEventListener(event, _handleUserActivity, { passive: true })
  );

  // Start periodic inactivity checks
  if (_inactivityCheckInterval) clearInterval(_inactivityCheckInterval);
  _inactivityCheckInterval = setInterval(
    _checkInactivity,
    SESSION_CONFIG.CHECK_INTERVAL
  );
};

/**
 * Stops the session inactivity timer and removes all activity event listeners.
 * Must be called on logout.
 */
export const stopSessionTimer = () => {
  if (_inactivityCheckInterval) {
    clearInterval(_inactivityCheckInterval);
    _inactivityCheckInterval = null;
  }

  const events = ["click", "keydown", "mousemove", "touchstart", "scroll"];
  events.forEach((event) =>
    document.removeEventListener(event, _handleUserActivity)
  );

  _onSessionExpiredCallback = null;
};

// ─────────────────────────────────────────────
// Full Session Initializer
// ─────────────────────────────────────────────

/**
 * Initializes the complete user session after a successful login.
 * Stores user data, records timestamps, and starts the inactivity timer.
 *
 * @param {import("firebase/auth").User} user - Firebase Auth user.
 * @param {Function} onSessionExpired - Callback for session timeout.
 */
export const initializeSession = (user, onSessionExpired) => {
  storeAuthUser(user);
  storeLoginTimestamp();
  updateLastActivity();
  markSessionActive();
  startSessionTimer(onSessionExpired);
};

/**
 * Completely tears down the current user session.
 * Stops timer, removes listeners, and wipes storage.
 */
export const destroySession = () => {
  stopSessionTimer();
  clearSession();
};
