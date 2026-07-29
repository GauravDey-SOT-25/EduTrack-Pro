import { preferences } from "./storage.js";
import { $, clamp, escapeHtml, formatDate, formatPercent, getInitials } from "./utils.js";

const iconPaths = {
  dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/>',
  courses: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V5H6.5A2.5 2.5 0 0 0 4 7.5v12ZM4 19.5V7.5M8 8h8M8 11h7"/>',
  progress: '<path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6"/>',
  analytics: '<path d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6m4 6V6"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 20c.8-3.7 3.4-5.5 8-5.5s7.2 1.8 8 5.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.08h-3v-.08A1.7 1.7 0 0 0 10.68 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.04 15a1.7 1.7 0 0 0-1.56-1.04H5.4v-3h.08A1.7 1.7 0 0 0 7.04 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.08v3H21a1.7 1.7 0 0 0-1.6 1.04Z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c.7-3.2 2.7-5 6-5s5.3 1.8 6 5M16 5.5a3 3 0 0 1 0 5M17 14c2.2.2 3.5 1.5 4 3.5"/>',
  reports: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
  logout: '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M20.4 15.5A8 8 0 0 1 8.5 3.6 8 8 0 1 0 20.4 15.5Z"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.35-4.35"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8v.01"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/>',
  book: '<path d="M4 18.5V5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21m0-2.5A2.5 2.5 0 0 1 6.5 16H20"/>',
  trend: '<path d="M4 17 10 11l4 3 6-8"/><path d="M15 6h5v5"/>'
};

export const icon = (name, className = "h-5 w-5") => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;

export const initTheme = () => {
  document.documentElement.classList.toggle("dark", preferences.theme === "dark");
};

export const toggleTheme = () => {
  preferences.theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  initTheme();
  return preferences.theme;
};

export const avatar = (person = {}, className = "h-10 w-10") => {
  const name = person.displayName || person.name || "User";
  if (person.photoURL) {
    return `<img class="avatar-image ${className} rounded-full" src="${escapeHtml(person.photoURL)}" alt="${escapeHtml(name)} profile picture" onerror="this.replaceWith(Object.assign(document.createElement('span'), {className: 'avatar-fallback ${className} rounded-full', textContent: '${getInitials(name)}'}))">`;
  }
  return `<span class="avatar-fallback ${className} rounded-full" aria-label="${escapeHtml(name)}">${getInitials(name)}</span>`;
};

export const progressBar = (value, tone = "indigo", label = "Progress") => {
  const safeValue = clamp(value);
  const colors = { indigo: "bg-indigo-600", teal: "bg-teal-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  return `<div class="w-full" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${safeValue}">
    <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div class="h-full rounded-full ${colors[tone] || colors.indigo} transition-all duration-700" style="width: ${safeValue}%"></div></div>
  </div>`;
};

export const statusBadge = (status = "active") => {
  const normalized = String(status).toLowerCase();
  const styles = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300",
    completed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-300",
    "in progress": "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300",
    at_risk: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300",
    inactive: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300"
  };
  const label = normalized.replaceAll("_", " ");
  return `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${styles[normalized] || styles.active}">${escapeHtml(label)}</span>`;
};

export const metricCard = ({ label, value, detail = "", iconName = "trend", tone = "indigo" }) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300"
  };
  return `<article class="surface card-hover rounded-2xl p-5 fade-up">
    <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-semibold text-slate-500 dark:text-slate-400">${escapeHtml(label)}</p><p class="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">${escapeHtml(value)}</p>${detail ? `<p class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">${escapeHtml(detail)}</p>` : ""}</div><span class="grid h-10 w-10 place-items-center rounded-xl ${tones[tone] || tones.indigo}">${icon(iconName)}</span></div>
  </article>`;
};

export const courseCard = (enrollment) => {
  const course = enrollment.course || {};
  const completion = clamp(enrollment.completionPercentage);
  const modulesCompleted = Number(enrollment.modulesCompleted || 0);
  const modulesTotal = Number(enrollment.modulesTotal || course.modulesTotal || 0);
  return `<article class="surface card-hover overflow-hidden rounded-2xl fade-up">
    <div class="course-art relative flex h-32 items-center justify-center overflow-hidden">
      ${course.thumbnailURL ? `<img src="${escapeHtml(course.thumbnailURL)}" alt="${escapeHtml(course.title || "Course")} thumbnail" loading="lazy">` : `<span class="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-indigo-600 shadow-sm dark:bg-slate-900/45 dark:text-indigo-200">${icon("book", "h-6 w-6")}</span>`}
      <div class="absolute right-3 top-3">${statusBadge(enrollment.status || (completion >= 100 ? "completed" : "in progress"))}</div>
    </div>
    <div class="p-5"><p class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">${escapeHtml(course.category || "Learning")}</p><h3 class="mt-1 line-clamp-1 text-base font-bold text-slate-900 dark:text-white">${escapeHtml(course.title || "Untitled course")}</h3><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(course.instructorName || "Instructor not assigned")}</p>
      <div class="mt-5 flex items-end justify-between"><div><p class="text-2xl font-extrabold text-slate-900 dark:text-white">${formatPercent(completion)}</p><p class="text-xs font-medium text-slate-500 dark:text-slate-400">${modulesCompleted} of ${modulesTotal || "—"} modules</p></div><span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${course.duration || "Self paced"}</span></div>
      <div class="mt-3">${progressBar(completion, "indigo", `${course.title || "Course"} completion`)}</div><p class="mt-3 text-xs text-slate-400 dark:text-slate-500">Updated ${formatDate(enrollment.lastUpdated)}</p>
    </div>
  </article>`;
};

export const emptyState = ({ iconName = "book", title, description, actionLabel = "", actionId = "" }) => `<section class="surface rounded-2xl px-6 py-12 text-center"><span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">${icon(iconName, "h-7 w-7")}</span><h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">${escapeHtml(title)}</h3><p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(description)}</p>${actionLabel ? `<button id="${escapeHtml(actionId)}" class="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">${escapeHtml(actionLabel)}</button>` : ""}</section>`;

export const errorState = ({ title = "Unable to load this page", description = "Please check your connection and try again.", retryId = "retry-page" } = {}) => `<section class="surface rounded-2xl px-6 py-12 text-center"><span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">${icon("info", "h-7 w-7")}</span><h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">${escapeHtml(title)}</h3><p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(description)}</p><button id="${escapeHtml(retryId)}" class="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">Try again</button></section>`;

export const loadingCards = (count = 4) => `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${Array.from({ length: count }, () => '<div class="surface rounded-2xl p-5"><div class="skeleton h-5 w-24"></div><div class="skeleton mt-4 h-8 w-20"></div><div class="skeleton mt-4 h-3 w-full"></div></div>').join("")}</div>`;

export const showToast = (message, type = "info") => {
  let container = $("#toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3";
    container.setAttribute("aria-live", "polite");
    document.body.append(container);
  }
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-100",
    error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-950 dark:text-rose-100",
    info: "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-500/20 dark:bg-indigo-950 dark:text-indigo-100"
  };
  const toast = document.createElement("div");
  toast.className = `toast flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold shadow-lg ${styles[type] || styles.info}`;
  toast.innerHTML = `<span class="mt-0.5 shrink-0">${icon(type === "success" ? "check" : type === "error" ? "info" : "info", "h-5 w-5")}</span><p class="flex-1 leading-5">${escapeHtml(message)}</p><button class="-mr-1 -mt-1 rounded-md p-1 opacity-70 hover:opacity-100" aria-label="Dismiss notification">${icon("close", "h-4 w-4")}</button>`;
  toast.querySelector("button").addEventListener("click", () => toast.remove());
  container.append(toast);
  window.setTimeout(() => toast.remove(), 5500);
};

export const setButtonLoading = (button, isLoading, label = "Loading…") => {
  if (!button) return;
  if (isLoading) {
    button.dataset.label = button.innerHTML;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `<span class="spinner mr-2 inline-block align-middle"></span>${escapeHtml(label)}`;
  } else {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = button.dataset.label || button.innerHTML;
  }
};

export const showModal = ({ title, content, confirmLabel = "Confirm", onConfirm, destructive = false }) => {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop fixed inset-0 z-[90] grid place-items-center p-4";
  overlay.innerHTML = `<div class="surface w-full max-w-md rounded-2xl p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="flex items-start justify-between gap-4"><h2 id="modal-title" class="text-lg font-extrabold text-slate-900 dark:text-white">${escapeHtml(title)}</h2><button data-close class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10" aria-label="Close">${icon("close")}</button></div><div class="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">${content}</div><div class="mt-6 flex justify-end gap-3"><button data-close class="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">Cancel</button><button data-confirm class="rounded-xl px-4 py-2 text-sm font-bold text-white ${destructive ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"}">${escapeHtml(confirmLabel)}</button></div></div>`;
  const close = () => overlay.remove();
  overlay.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", close));
  overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
  overlay.querySelector("[data-confirm]").addEventListener("click", async () => { await onConfirm?.(); close(); });
  document.body.append(overlay);
  overlay.querySelector("[data-close]").focus();
};

const navItems = {
  student: [
    ["dashboard", "Dashboard", "student-dashboard.html"], ["courses", "Courses", "courses.html"], ["progress", "Progress", "progress.html"], ["analytics", "Analytics", "analytics.html"], ["profile", "Profile", "profile.html"], ["settings", "Settings", "settings.html"]
  ],
  instructor: [
    ["dashboard", "Dashboard", "instructor-dashboard.html"], ["users", "Students", "students.html"], ["reports", "Reports", "reports.html"], ["analytics", "Analytics", "analytics.html"], ["profile", "Profile", "profile.html"], ["settings", "Settings", "settings.html"]
  ]
};

export const mountAppShell = ({ profile, activePage, title, subtitle = "", onLogout }) => {
  const root = $("#app-root");
  const items = navItems[profile.role] || navItems.student;
  root.innerHTML = `<div class="app-background min-h-screen text-slate-800 dark:text-slate-100">
    <aside id="app-sidebar" class="scrollbar-thin fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white/85 px-3 py-4 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#181c2b]/90 lg:translate-x-0" aria-label="Primary navigation">
      <div class="flex items-center gap-3 px-2"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">${icon("book", "h-5 w-5")}</span><div class="brand-copy min-w-0"><p class="truncate font-display text-sm font-extrabold text-slate-900 dark:text-white">EduTrack <span class="text-indigo-600 dark:text-indigo-300">Pro</span></p><p class="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Learning OS</p></div></div>
      <nav class="mt-9 flex-1 space-y-1">${items.map(([key, label, href]) => `<a class="nav-link ${activePage === key ? "active" : ""}" href="${href}" ${activePage === key ? 'aria-current="page"' : ""}>${icon(key)}<span class="sidebar-label">${label}</span></a>`).join("")}</nav>
      <div class="mt-4 border-t border-slate-100 pt-4 dark:border-white/10"><div class="sidebar-profile-copy mb-3 flex items-center gap-2 px-2">${avatar(profile, "h-8 w-8")}<div class="min-w-0"><p class="truncate text-xs font-bold text-slate-700 dark:text-slate-200">${escapeHtml(profile.displayName || "Account")}</p><p class="truncate text-[11px] text-slate-400">${escapeHtml(profile.role || "student")}</p></div></div><button id="sidebar-logout" class="nav-link w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-400/10">${icon("logout")}<span class="sidebar-label">Logout</span></button></div>
    </aside>
    <div id="sidebar-overlay" class="fixed inset-0 z-40 hidden bg-slate-950/35 lg:hidden"></div>
    <div class="min-h-screen lg:pl-64 transition-all duration-300">
      <header class="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f6f7fb]/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#10131e]/80 sm:px-6 lg:px-8"><div class="mx-auto flex max-w-[1600px] items-center justify-between gap-3"><div class="flex min-w-0 items-center gap-3"><button id="mobile-menu" class="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-white/10 lg:hidden" aria-label="Open navigation">${icon("menu")}</button><button id="desktop-sidebar-toggle" class="hidden rounded-xl p-2 text-slate-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-white/10 lg:inline-flex" aria-label="Toggle sidebar">${icon("menu")}</button><div class="min-w-0"><p class="hidden text-xs font-semibold text-slate-400 sm:block">Workspace / ${escapeHtml(profile.role === "instructor" ? "Instructor" : "Student")}</p><h1 class="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">${escapeHtml(title)}</h1></div></div><div class="flex items-center gap-1 sm:gap-2"><button id="theme-toggle" class="rounded-xl p-2.5 text-slate-500 transition hover:bg-white hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300" aria-label="Toggle color theme">${icon("sun")}</button><button id="notifications-button" class="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-white hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300" aria-label="Notifications">${icon("bell")}<span class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500"></span></button><div class="ml-1 hidden items-center gap-2 border-l border-slate-200 pl-3 dark:border-white/10 sm:flex">${avatar(profile, "h-8 w-8")}<div class="hidden xl:block"><p class="max-w-32 truncate text-xs font-bold text-slate-700 dark:text-slate-200">${escapeHtml(profile.displayName || "Account")}</p><p class="text-[11px] capitalize text-slate-400">${escapeHtml(profile.role || "student")}</p></div></div></div></div></header>
      <main id="page-content" class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><div class="mb-7"><p class="text-sm font-medium text-slate-500 dark:text-slate-400">${escapeHtml(subtitle)}</p></div></main>
      <footer class="mx-auto max-w-[1600px] px-4 pb-6 text-center text-xs font-medium text-slate-400 sm:px-6 lg:px-8">© ${new Date().getFullYear()} EduTrack Pro · Built for purposeful learning</footer>
    </div>
  </div>`;

  const sidebar = $("#app-sidebar");
  const overlay = $("#sidebar-overlay");
  const toggleMobile = (open) => { sidebar.classList.toggle("-translate-x-full", !open); overlay.classList.toggle("hidden", !open); };
  if (window.innerWidth < 1024) sidebar.classList.add("-translate-x-full");
  $("#mobile-menu")?.addEventListener("click", () => toggleMobile(true));
  overlay?.addEventListener("click", () => toggleMobile(false));
  $("#desktop-sidebar-toggle")?.addEventListener("click", () => {
    document.documentElement.classList.toggle("sidebar-collapsed");
    preferences.sidebarCollapsed = document.documentElement.classList.contains("sidebar-collapsed");
    document.querySelector(".lg\\:pl-64")?.classList.toggle("lg:pl-[5.25rem]", preferences.sidebarCollapsed);
  });
  if (preferences.sidebarCollapsed) {
    document.documentElement.classList.add("sidebar-collapsed");
    document.querySelector(".lg\\:pl-64")?.classList.add("lg:pl-[5.25rem]");
  }
  $("#theme-toggle")?.addEventListener("click", () => { const theme = toggleTheme(); showToast(`${theme === "dark" ? "Dark" : "Light"} theme enabled.`, "info"); });
  $("#notifications-button")?.addEventListener("click", () => showToast("Notifications are ready for your Firebase-backed events.", "info"));
  $("#sidebar-logout")?.addEventListener("click", onLogout);
};
