import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { getInstructorDashboardData } from "../data-service.js";
import { chartCard, renderChart } from "../charts.js";
import { errorState, metricCard, progressBar } from "../components.js";
import { average, escapeHtml, formatNumber } from "../utils.js";

const exportCsv = (rows) => {
  const headers = ["Student", "Email", "Student ID", "Courses", "Completion", "Grade", "Attendance", "Status"];
  const csv = [headers, ...rows.map((student) => [student.displayName, student.email, student.studentId, student.courses.join("; "), student.completionPercentage, student.gradeAverage, student.attendancePercentage, student.status])]
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "edutrack-student-report.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const loadReports = async ({ profile }) => {
  try {
    const data = await getInstructorDashboardData();
    const courseStats = data.courses.map((course) => {
      const records = data.enrollments.filter((item) => item.courseId === course.id);
      return { title: course.title || "Untitled course", learners: records.length, completion: average(records.map((item) => item.completionPercentage)), attendance: average(records.map((item) => item.attendancePercentage)) };
    });
    const atRisk = data.students.filter((student) => student.status === "at_risk" || student.completionPercentage < 50).length;
    setPageContent(`<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reports</h2><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">A download-ready view of learner and course performance.</p></div><button id="export-students" class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">Export student CSV</button></section><section class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${metricCard({ label: "Total learners", value: formatNumber(data.students.length), detail: "Student profile records", iconName: "users" })}${metricCard({ label: "At-risk learners", value: formatNumber(atRisk), detail: "Flagged by status or progress", iconName: "info", tone: "rose" })}${metricCard({ label: "Average grade", value: `${average(data.students.map((student) => student.gradeAverage))}%`, detail: "Overall assessment performance", iconName: "trend", tone: "teal" })}${metricCard({ label: "Average attendance", value: `${average(data.students.map((student) => student.attendancePercentage))}%`, detail: "Enrollment attendance values", iconName: "calendar", tone: "amber" })}</section><section class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]"><article class="surface rounded-2xl p-5 sm:p-6"><div><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Course performance</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Enrollment, completion, and attendance by course.</p></div><div class="mt-6 space-y-5">${courseStats.length ? courseStats.map((course) => `<div><div class="flex items-start justify-between gap-3"><div><p class="text-sm font-bold text-slate-800 dark:text-slate-100">${escapeHtml(course.title)}</p><p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${course.learners} learner${course.learners === 1 ? "" : "s"} · ${course.attendance}% average attendance</p></div><p class="text-sm font-extrabold text-slate-800 dark:text-white">${course.completion}%</p></div><div class="mt-2">${progressBar(course.completion, course.completion >= 75 ? "teal" : "amber", `${course.title} completion`)}</div></div>`).join("") : '<p class="text-sm text-slate-500 dark:text-slate-400">No course records are available.</p>'}</div></article>${chartCard({ title: "Course completion", description: "Average learner completion per course", canvasId: "reports-completion" })}</section>`);
    document.querySelector("#export-students").addEventListener("click", () => exportCsv(data.students));
    renderChart(document.querySelector("#reports-completion"), { type: "bar", labels: courseStats.map((course) => course.title), values: courseStats.map((course) => course.completion), label: "Completion", colors: ["#4f46e5"] });
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load reports", description: error.message }));
    bindPageRetry(() => loadReports({ profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["instructor"], activePage: "reports", title: "Reports", subtitle: "Performance exports", load: loadReports });
