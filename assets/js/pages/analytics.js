import { initializeProtectedPage, bindPageRetry, setPageContent } from "../app.js";
import { getInstructorDashboardData, getStudentAnalytics, getStudentDashboardData } from "../data-service.js";
import { chartCard, renderChart } from "../charts.js";
import { errorState, metricCard } from "../components.js";
import { average, formatNumber } from "../utils.js";

const renderStudentAnalytics = async (user) => {
  const data = await getStudentDashboardData(user.uid);
  const analytics = getStudentAnalytics(data);
  setPageContent(`<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${metricCard({ label: "Average grade", value: `${analytics.averageGrade}%`, detail: "All submitted assessments", iconName: "trend" })}${metricCard({ label: "Attendance", value: `${analytics.attendanceRate}%`, detail: "Recorded attendance", iconName: "calendar", tone: "teal" })}${metricCard({ label: "Completion", value: `${analytics.averageCompletion}%`, detail: "Across enrolled courses", iconName: "progress", tone: "amber" })}${metricCard({ label: "Assessments", value: formatNumber(data.assessments.length), detail: "Performance records", iconName: "analytics", tone: "rose" })}</section><section class="mt-7 grid gap-6 xl:grid-cols-2">${chartCard({ title: "Scores by type", description: "Quiz and assignment averages", canvasId: "analytics-scores" })}${chartCard({ title: "Score trend", description: "Latest assessment submissions", canvasId: "analytics-trend" })}${chartCard({ title: "Course completion", description: "Completion across your current courses", canvasId: "analytics-completion", compact: true })}${chartCard({ title: "Attendance and progress", description: "A quick balance of learning consistency", canvasId: "analytics-balance", compact: true })}</section>`);
  renderChart(document.querySelector("#analytics-scores"), { type: "bar", labels: analytics.scoreByType.map((item) => item.label), values: analytics.scoreByType.map((item) => item.value), label: "Average score" });
  renderChart(document.querySelector("#analytics-trend"), { type: "line", labels: analytics.weekly.map((item) => item.label), values: analytics.weekly.map((item) => item.value), label: "Score" });
  renderChart(document.querySelector("#analytics-completion"), { type: "doughnut", labels: analytics.completion.map((item) => item.label), values: analytics.completion.map((item) => item.value), label: "Completion" });
  renderChart(document.querySelector("#analytics-balance"), { type: "doughnut", labels: ["Attendance", "Course completion"], values: [analytics.attendanceRate, analytics.averageCompletion], label: "Rate", colors: ["#14b8a6", "#4f46e5"] });
};

const renderInstructorAnalytics = async () => {
  const data = await getInstructorDashboardData();
  const students = data.students;
  const courseStats = data.courses.map((course) => {
    const records = data.enrollments.filter((item) => item.courseId === course.id);
    return { label: course.title || "Course", completion: average(records.map((item) => item.completionPercentage)), learners: records.length };
  });
  const gradeBands = [
    { label: "90–100", value: students.filter((student) => student.gradeAverage >= 90).length },
    { label: "75–89", value: students.filter((student) => student.gradeAverage >= 75 && student.gradeAverage < 90).length },
    { label: "60–74", value: students.filter((student) => student.gradeAverage >= 60 && student.gradeAverage < 75).length },
    { label: "Below 60", value: students.filter((student) => student.gradeAverage < 60).length }
  ];
  setPageContent(`<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${metricCard({ label: "Learners", value: formatNumber(students.length), detail: "Student profiles", iconName: "users" })}${metricCard({ label: "Average grade", value: `${average(students.map((student) => student.gradeAverage))}%`, detail: "Across all learners", iconName: "trend", tone: "teal" })}${metricCard({ label: "Average completion", value: `${average(students.map((student) => student.completionPercentage))}%`, detail: "Learning progress", iconName: "progress", tone: "amber" })}${metricCard({ label: "Active courses", value: formatNumber(data.courses.length), detail: "Available courses", iconName: "courses", tone: "rose" })}</section><section class="mt-7 grid gap-6 xl:grid-cols-2">${chartCard({ title: "Completion by course", description: "Average completion across enrolled learners", canvasId: "analytics-course-completion" })}${chartCard({ title: "Grade distribution", description: "Learners grouped by average score", canvasId: "analytics-grade-bands" })}${chartCard({ title: "Course enrollment", description: "Number of learner enrollments per course", canvasId: "analytics-enrollment", compact: true })}${chartCard({ title: "Engagement balance", description: "Grades compared with completion", canvasId: "analytics-engagement", compact: true })}</section>`);
  renderChart(document.querySelector("#analytics-course-completion"), { type: "bar", labels: courseStats.map((item) => item.label), values: courseStats.map((item) => item.completion), label: "Completion" });
  renderChart(document.querySelector("#analytics-grade-bands"), { type: "doughnut", labels: gradeBands.map((item) => item.label), values: gradeBands.map((item) => item.value), label: "Learners" });
  renderChart(document.querySelector("#analytics-enrollment"), { type: "bar", labels: courseStats.map((item) => item.label), values: courseStats.map((item) => item.learners), label: "Enrollments", colors: ["#14b8a6"] });
  renderChart(document.querySelector("#analytics-engagement"), { type: "doughnut", labels: ["Average grade", "Average completion"], values: [average(students.map((student) => student.gradeAverage)), average(students.map((student) => student.completionPercentage))], label: "Rate", colors: ["#4f46e5", "#f59e0b"] });
};

const loadAnalytics = async ({ user, profile }) => {
  try {
    if (profile.role === "instructor") await renderInstructorAnalytics();
    else await renderStudentAnalytics(user);
  } catch (error) {
    setPageContent(errorState({ title: "Unable to load analytics", description: error.message }));
    bindPageRetry(() => loadAnalytics({ user, profile }));
  }
};

initializeProtectedPage({ allowedRoles: ["student", "instructor"], activePage: "analytics", title: "Analytics", subtitle: "Performance insights", load: loadAnalytics });
