import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { changePassword } from "../auth.js";
import { updateUserProfile } from "../data-service.js";
import { errorState, setButtonLoading, showToast, toggleTheme } from "../components.js";
import { $, errorMessage, escapeHtml } from "../utils.js";
import { preferences } from "../storage.js";

const loadSettings = async ({ user, profile }) => {
  try {
    const notify = profile.preferences?.notifications !== false;
    setPageContent(`<section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,.65fr)]"><form id="profile-settings" class="surface rounded-2xl p-5 sm:p-6"><div><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Profile settings</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Update information visible in your workspace.</p></div><div class="mt-6 grid gap-5"><label class="block"><span class="text-sm font-bold text-slate-700 dark:text-slate-200">Display name</span><input name="displayName" required maxlength="80" value="${escapeHtml(profile.displayName || "")}" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-white" autocomplete="name"></label><label class="block"><span class="text-sm font-bold text-slate-700 dark:text-slate-200">Profile image URL</span><input name="photoURL" type="url" value="${escapeHtml(profile.photoURL || "")}" placeholder="https://…" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-white" inputmode="url"><span class="mt-2 block text-xs text-slate-400">Use a secure, publicly accessible image URL. Firebase Storage is intentionally not required.</span></label><label class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-white/10"><span><span class="block text-sm font-bold text-slate-800 dark:text-slate-100">Learning notifications</span><span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">Receive updates about activity and progress.</span></span><input name="notifications" type="checkbox" class="h-5 w-5" ${notify ? "checked" : ""}></label></div><button id="save-profile" class="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">Save profile</button></form><div class="space-y-6"><section class="surface rounded-2xl p-5 sm:p-6"><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Appearance</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose your preferred workspace theme.</p><button id="theme-setting" class="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 dark:border-white/10 dark:hover:border-indigo-400/50"><span><span class="block text-sm font-bold text-slate-800 dark:text-slate-100">Toggle dark mode</span><span id="theme-status" class="mt-1 block text-xs text-slate-500 dark:text-slate-400">${preferences.theme === "dark" ? "Dark mode is active" : "Light mode is active"}</span></span><span class="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">◐</span></button></section><form id="password-settings" class="surface rounded-2xl p-5 sm:p-6"><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Password</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a strong, unique password for your account.</p><div class="mt-5 space-y-4"><label class="block"><span class="text-sm font-bold text-slate-700 dark:text-slate-200">New password</span><input name="password" type="password" required minlength="8" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-white" autocomplete="new-password"></label><label class="block"><span class="text-sm font-bold text-slate-700 dark:text-slate-200">Confirm password</span><input name="confirmPassword" type="password" required minlength="8" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-white" autocomplete="new-password"></label></div><button id="save-password" class="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">Update password</button></form></div></section>`);

    $("#profile-settings").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#save-profile");
      const data = new FormData(event.currentTarget);
      try {
        setButtonLoading(button, true, "Saving…");
        await updateUserProfile(user.uid, { displayName: String(data.get("displayName")).trim(), photoURL: String(data.get("photoURL")).trim(), preferences: { ...profile.preferences, notifications: data.get("notifications") === "on" } });
        showToast("Your profile preferences have been saved.", "success");
      } catch (error) { showToast(errorMessage(error), "error"); } finally { setButtonLoading(button, false); }
    });
    $("#theme-setting").addEventListener("click", () => { const mode = toggleTheme(); $("#theme-status").textContent = `${mode === "dark" ? "Dark" : "Light"} mode is active`; });
    $("#password-settings").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("#save-password");
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirmPassword")) { showToast("The password confirmation does not match.", "error"); return; }
      try { setButtonLoading(button, true, "Updating…"); await changePassword(String(data.get("password"))); event.currentTarget.reset(); showToast("Password updated successfully.", "success"); } catch (error) { showToast(errorMessage(error), "error"); } finally { setButtonLoading(button, false); }
    });
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load settings", description: error.message }));
    bindPageRetry(() => loadSettings({ user, profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["student", "instructor"], activePage: "settings", title: "Settings", subtitle: "Profile and preferences", load: loadSettings });
