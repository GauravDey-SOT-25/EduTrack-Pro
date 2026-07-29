import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { getStudentDashboardData } from "../data-service.js";
import { courseCard, emptyState, errorState, icon } from "../components.js";
import { $ } from "../utils.js";

const renderCourses = (enrollments, filter = "all") => {
  const filtered = filter === "all" ? enrollments : enrollments.filter((item) => {
    const status = String(item.status || (Number(item.completionPercentage) >= 100 ? "completed" : "in progress")).toLowerCase();
    return filter === "active" ? status !== "completed" : status === filter;
  });
  const grid = $("#course-grid");
  grid.innerHTML = filtered.length ? filtered.map(courseCard).join("") : emptyState({ iconName: "courses", title: "No matching courses", description: "Try another course status or ask your instructor about enrollment." });
  $("#course-count").textContent = `${filtered.length} course${filtered.length === 1 ? "" : "s"}`;
};

const loadCourses = async ({ user, profile }) => {
  try {
    const { enrollments } = await getStudentDashboardData(user.uid);
    setPageContent(`<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">My courses</h2><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Monitor the learning paths you are currently enrolled in.</p></div><div class="flex items-center gap-2"><span id="course-count" class="text-sm font-bold text-slate-500 dark:text-slate-400"></span><label class="sr-only" for="course-filter">Filter courses</label><select id="course-filter" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"><option value="all">All courses</option><option value="active">In progress</option><option value="completed">Completed</option></select></div></section><section id="course-grid" class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"></section>`);
    renderCourses(enrollments);
    $("#course-filter").addEventListener("change", (event) => renderCourses(enrollments, event.target.value));
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load courses", description: error.message }));
    bindPageRetry(() => loadCourses({ user, profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["student"], activePage: "courses", title: "Courses", subtitle: "Course library", load: loadCourses });
