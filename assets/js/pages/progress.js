import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { getStudentAnalytics, getStudentDashboardData } from "../data-service.js";
import { chartCard, renderChart } from "../charts.js";
import { emptyState, errorState, icon, metricCard, progressBar, statusBadge } from "../components.js";
import { clamp, escapeHtml, formatPercent } from "../utils.js";

const loadProgress = async ({ user, profile }) => {
  try {
    const data = await getStudentDashboardData(user.uid);
    const analytics = getStudentAnalytics(data);
    const completed = data.enrollments.filter((item) => clamp(item.completionPercentage) >= 100).length;
    const pendingModules = data.enrollments.reduce((total, item) => total + Math.max(0, Number(item.modulesTotal || 0) - Number(item.modulesCompleted || 0)), 0);
    setPageContent(`<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">${metricCard({ label: "Overall completion", value: formatPercent(analytics.averageCompletion), detail: "Across your enrolled courses", iconName: "progress" })}${metricCard({ label: "Courses completed", value: String(completed), detail: `Out of ${data.enrollments.length} enrolled`, iconName: "check", tone: "teal" })}${metricCard({ label: "Pending modules", value: String(pendingModules), detail: "Modules still to complete", iconName: "book", tone: "amber" })}</section><section class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]"><article class="surface rounded-2xl p-5 sm:p-6"><div class="flex items-center justify-between"><div><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Course milestones</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Your completion status by course.</p></div><span class="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">${icon("progress")}</span></div><div class="mt-6 space-y-5">${data.enrollments.length ? data.enrollments.map((item) => `<div><div class="mb-2 flex items-start justify-between gap-3"><div><p class="text-sm font-bold text-slate-800 dark:text-slate-100">${escapeHtml(item.course?.title || "Untitled course")}</p><p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">${Number(item.modulesCompleted || 0)} of ${Number(item.modulesTotal || 0)} modules completed</p></div><div class="text-right"><p class="text-sm font-extrabold text-slate-900 dark:text-white">${formatPercent(item.completionPercentage)}</p>${statusBadge(item.status || "in progress")}</div></div>${progressBar(item.completionPercentage, clamp(item.completionPercentage) >= 100 ? "teal" : "indigo", item.course?.title || "Course")}</div>`).join("") : emptyState({ title: "Nothing to track yet", description: "Progress will show once courses have been added to your account." })}</div></article>${chartCard({ title: "Completion overview", description: "Progress distribution by course", canvasId: "progress-doughnut", compact: true })}</section><section class="mt-7">${chartCard({ title: "Performance trend", description: "Your latest quiz and assignment scores", canvasId: "progress-line", compact: true })}</section>`);
    renderChart(document.querySelector("#progress-doughnut"), { type: "doughnut", labels: analytics.completion.map((item) => item.label), values: analytics.completion.map((item) => item.value), label: "Completion" });
    renderChart(document.querySelector("#progress-line"), { type: "line", labels: analytics.weekly.map((item) => item.label), values: analytics.weekly.map((item) => item.value), label: "Score" });
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load progress", description: error.message }));
    bindPageRetry(() => loadProgress({ user, profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["student"], activePage: "progress", title: "Progress", subtitle: "Learning milestones", load: loadProgress });
