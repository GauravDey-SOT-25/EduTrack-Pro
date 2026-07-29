import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { getInstructorDashboardData, getStudentAnalytics, getStudentDashboardData } from "../data-service.js";
import { avatar, errorState, metricCard } from "../components.js";
import { escapeHtml, formatGpa, formatNumber } from "../utils.js";

const row = (label, value) => `<div class="border-b border-slate-100 py-4 last:border-0 dark:border-white/10"><dt class="text-xs font-bold uppercase tracking-wider text-slate-400">${escapeHtml(label)}</dt><dd class="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">${escapeHtml(value || "Not provided")}</dd></div>`;

const loadProfile = async ({ user, profile }) => {
  try {
    let metrics = [];
    let studentRows = "";
    if (profile.role === "student") {
      const data = await getStudentDashboardData(user.uid);
      const analytics = getStudentAnalytics(data);
      metrics = [
        metricCard({ label: "Overall GPA", value: formatGpa(profile.gpa), detail: "Current academic record", iconName: "trend" }),
        metricCard({ label: "Course completion", value: `${analytics.averageCompletion}%`, detail: "Across enrolled courses", iconName: "progress", tone: "teal" }),
        metricCard({ label: "Attendance", value: `${analytics.attendanceRate}%`, detail: "Recorded attendance", iconName: "calendar", tone: "amber" })
      ];
      studentRows = `${row("Student ID", profile.studentId)}${row("Department", profile.department)}${row("Semester", profile.semester)}${row("Program", profile.program)}`;
    } else {
      const { students, courses } = await getInstructorDashboardData();
      metrics = [
        metricCard({ label: "Learners monitored", value: formatNumber(students.length), detail: "Students in your workspace", iconName: "users" }),
        metricCard({ label: "Courses available", value: formatNumber(courses.length), detail: "Active course catalog", iconName: "courses", tone: "teal" }),
        metricCard({ label: "Account role", value: "Instructor", detail: "Learning team access", iconName: "profile", tone: "amber" })
      ];
      studentRows = `${row("Faculty ID", profile.instructorId)}${row("Department", profile.department)}${row("Title", profile.title)}${row("Specialization", profile.specialization)}`;
    }
    setPageContent(`<section class="glass overflow-hidden rounded-3xl p-6 sm:p-8"><div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">${avatar(profile, "h-24 w-24")}<div class="flex-1"><p class="text-sm font-bold capitalize text-indigo-600 dark:text-indigo-300">${escapeHtml(profile.role || "Account")} profile</p><h2 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">${escapeHtml(profile.displayName || "Unnamed account")}</h2><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(profile.email || user.email || "")}</p></div><a href="settings.html" class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">Edit profile</a></div></section><section class="mt-6 grid gap-4 md:grid-cols-3">${metrics.join("")}</section><section class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]"><article class="surface rounded-2xl p-5 sm:p-6"><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Personal details</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Information associated with your EduTrack account.</p><dl class="mt-4">${row("Email address", profile.email || user.email)}${row("Phone", profile.phone)}${studentRows}</dl></article><article class="surface rounded-2xl p-5 sm:p-6"><h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Account preferences</h2><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage these preferences from Settings.</p><div class="mt-6 space-y-4"><div class="rounded-xl bg-slate-50 p-4 dark:bg-white/5"><p class="text-sm font-bold text-slate-800 dark:text-slate-100">Notification updates</p><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${profile.preferences?.notifications === false ? "Disabled" : "Enabled"}</p></div><div class="rounded-xl bg-slate-50 p-4 dark:bg-white/5"><p class="text-sm font-bold text-slate-800 dark:text-slate-100">Profile image</p><p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${profile.photoURL ? "Custom image set" : "Initials avatar in use"}</p></div></div></article></section>`);
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load your profile", description: error.message }));
    bindPageRetry(() => loadProfile({ user, profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["student", "instructor"], activePage: "profile", title: "Profile", subtitle: "Your account details", load: loadProfile });
