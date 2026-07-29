import {
  auth,
  assertFirebaseReady,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword
} from "./firebase.js";
import { getUserProfile } from "./data-service.js";
import { preferences, sessionStore } from "./storage.js";
import { $, errorMessage, redirectTo } from "./utils.js";
import { showToast, setButtonLoading } from "./components.js";

export const getAuthenticatedUser = () => new Promise((resolve, reject) => {
  try {
    assertFirebaseReady();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    }, reject);
  } catch (error) {
    reject(error);
  }
});

export const getCurrentProfile = async () => {
  const user = await getAuthenticatedUser();
  if (!user) return { user: null, profile: null };
  const profile = await getUserProfile(user.uid);
  return { user, profile };
};

export const signIn = async ({ email, password, role, rememberMe }) => {
  assertFirebaseReady();
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    await signOut(auth);
    throw new Error("Your account profile is missing. Please contact your administrator.");
  }
  if (profile.role !== role) {
    await signOut(auth);
    throw new Error(`This account is registered as an ${profile.role}. Select the matching role and try again.`);
  }
  preferences.rememberMe = rememberMe;
  sessionStore.set("last-login", { email: credential.user.email, role, at: Date.now() });
  return { user: credential.user, profile };
};

export const signOutCurrentUser = async () => {
  assertFirebaseReady();
  await signOut(auth);
  sessionStore.remove("current-page");
  redirectTo("../index.html");
};

export const resetPassword = async (email) => {
  assertFirebaseReady();
  await sendPasswordResetEmail(auth, email);
};

export const changePassword = async (newPassword) => {
  assertFirebaseReady();
  if (!auth.currentUser) throw new Error("Your session has expired. Please sign in again.");
  await updatePassword(auth.currentUser, newPassword);
};

export const protectPage = async (allowedRoles = []) => {
  const { user, profile } = await getCurrentProfile();
  if (!user) {
    redirectTo("../index.html");
    return null;
  }
  if (!profile) {
    await signOut(auth);
    redirectTo("../index.html");
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
    redirectTo(profile.role === "instructor" ? "instructor-dashboard.html" : "student-dashboard.html");
    return null;
  }
  return { user, profile };
};

export const initLoginPage = () => {
  const form = $("#login-form");
  const rememberMe = $("#remember-me");
  const emailInput = $("#email");
  const roleInput = () => document.querySelector('input[name="role"]:checked');
  rememberMe.checked = preferences.rememberMe;

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = $("#login-submit");
    const values = new FormData(form);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    const selectedRole = roleInput()?.value;
    const message = $("#form-message");
    message.classList.add("hidden");
    if (!email || !password || !selectedRole) {
      message.textContent = "Enter your email, password, and account role.";
      message.classList.remove("hidden");
      return;
    }
    try {
      setButtonLoading(submitButton, true, "Signing you in…");
      const { profile } = await signIn({ email, password, role: selectedRole, rememberMe: rememberMe.checked });
      redirectTo(profile.role === "instructor" ? "pages/instructor-dashboard.html" : "pages/student-dashboard.html");
    } catch (error) {
      message.textContent = errorMessage(error);
      message.classList.remove("hidden");
    } finally {
      setButtonLoading(submitButton, false);
    }
  });

  $("#forgot-password")?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showToast("Enter your email address first, then request a reset link.", "info");
      emailInput.focus();
      return;
    }
    try {
      await resetPassword(email);
      showToast("Password reset email sent. Check your inbox.", "success");
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  });
};
