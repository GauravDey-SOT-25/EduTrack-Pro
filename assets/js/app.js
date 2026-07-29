import { protectPage, signOutCurrentUser } from "./auth.js";
import { initTheme, loadingCards, mountAppShell } from "./components.js";
import { errorMessage, escapeHtml, $ } from "./utils.js";
import { sessionStore } from "./storage.js";

const fullPageError = (error) => `<main class="app-background grid min-h-screen place-items-center p-6"><section class="surface w-full max-w-lg rounded-3xl p-8 text-center"><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">!</div><h1 class="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">EduTrack Pro needs attention</h1><p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(errorMessage(error))}</p><a class="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700" href="../index.html">Return to sign in</a><p class="mt-4 text-xs leading-5 text-slate-400">Add your Firebase configuration in <code class="rounded bg-slate-100 px-1 py-0.5 dark:bg-white/10">assets/js/config.js</code>, then refresh.</p></section></main>`;

export const setPageContent = (html) => {
  const content = $("#page-content");
  if (content) content.innerHTML = html;
  return content;
};

export const setPageLoading = (count = 4) => setPageContent(loadingCards(count));

export const initializeProtectedPage = async ({ allowedRoles, activePage, title, subtitle, load }) => {
  initTheme();
  const root = $("#app-root");
  try {
    const context = await protectPage(allowedRoles);
    if (!context) return;
    mountAppShell({
      profile: context.profile,
      activePage,
      title,
      subtitle,
      onLogout: signOutCurrentUser
    });
    sessionStore.set("current-page", activePage);
    setPageLoading();
    await load({ ...context, content: $("#page-content") });
  } catch (error) {
    root.innerHTML = fullPageError(error);
  }
};

export const bindPageRetry = (callback, selector = "#retry-page") => {
  $(selector)?.addEventListener("click", callback, { once: true });
};
