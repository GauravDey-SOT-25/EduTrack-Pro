/**
 * @file firebase.js
 * @description Firebase App Initialization and Core Configuration
 * @module backend/firebase/firebase
 *
 * This is the single source of truth for Firebase initialization.
 * All other services import Firebase instances from this file.
 * Never initialize Firebase directly in service files or HTML pages.
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ─────────────────────────────────────────────
// Firebase Project Configuration
// ─────────────────────────────────────────────

/**
 * Firebase project configuration object.
 * Sourced from Firebase Console → Project Settings → SDK Config.
 *
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyDy5CjmIgf1zRuENOPzMZCr447ZvH--j80",
  authDomain: "edutrack-pro-7e6bc.firebaseapp.com",
  projectId: "edutrack-pro-7e6bc",
  storageBucket: "edutrack-pro-7e6bc.firebasestorage.app",
  messagingSenderId: "615481844056",
  appId: "1:615481844056:web:4f052239b356c73795c52d",
  measurementId: "G-81GMSFYEM8",
};

// ─────────────────────────────────────────────
// Firebase App Initialization (Singleton Guard)
// ─────────────────────────────────────────────

/**
 * Initialize Firebase App only once.
 * Prevents re-initialization on hot reloads or multiple imports.
 *
 * @type {import("firebase/app").FirebaseApp}
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─────────────────────────────────────────────
// Firebase Service Instances
// ─────────────────────────────────────────────

/**
 * Firebase Authentication instance.
 * Used by authService.js and sessionManager.js.
 *
 * @type {import("firebase/auth").Auth}
 */
const auth = getAuth(app);

/**
 * Firebase Firestore database instance.
 * Used by all service files (studentService, courseService, etc.).
 *
 * @type {import("firebase/firestore").Firestore}
 */
const db = getFirestore(app);

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export { app, auth, db };
