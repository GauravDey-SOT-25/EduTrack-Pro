import {
  db,
  assertFirebaseReady,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp
} from "./firebase.js";
import { average, toDate } from "./utils.js";

const docsToData = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

const getCollection = async (name, constraints = []) => {
  assertFirebaseReady();
  const snapshot = await getDocs(constraints.length ? query(collection(db, name), ...constraints) : collection(db, name));
  return docsToData(snapshot);
};

const sortByDateDesc = (items, key) => [...items].sort((a, b) => {
  const first = toDate(a[key])?.getTime() || 0;
  const second = toDate(b[key])?.getTime() || 0;
  return second - first;
});

export const getUserProfile = async (uid) => {
  assertFirebaseReady();
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const getCoursesByIds = async (courseIds = []) => {
  const uniqueIds = [...new Set(courseIds.filter(Boolean))];
  const courses = await Promise.all(uniqueIds.map(async (courseId) => {
    const snapshot = await getDoc(doc(db, "courses", courseId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }));
  return courses.filter(Boolean);
};

export const getStudentDashboardData = async (studentId) => {
  const [enrollments, assessments, attendance, activities] = await Promise.all([
    getCollection("enrollments", [where("studentId", "==", studentId)]),
    getCollection("assessments", [where("studentId", "==", studentId)]),
    getCollection("attendance", [where("studentId", "==", studentId)]),
    getCollection("activities", [where("userId", "==", studentId), limit(25)])
  ]);
  const courses = await getCoursesByIds(enrollments.map((enrollment) => enrollment.courseId));
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const enrichedEnrollments = enrollments.map((enrollment) => ({
    ...enrollment,
    course: courseMap.get(enrollment.courseId) || null
  }));

  return {
    enrollments: enrichedEnrollments,
    assessments: sortByDateDesc(assessments, "submittedAt"),
    attendance: sortByDateDesc(attendance, "date"),
    activities: sortByDateDesc(activities, "createdAt").slice(0, 5)
  };
};

export const getStudentAnalytics = ({ enrollments = [], assessments = [], attendance = [] }) => {
  const scoreByType = ["quiz", "assignment"].map((type) => ({
    label: type === "quiz" ? "Quizzes" : "Assignments",
    value: average(assessments.filter((item) => item.type === type).map((item) => item.score))
  }));
  const weekly = [...assessments]
    .sort((a, b) => (toDate(a.submittedAt)?.getTime() || 0) - (toDate(b.submittedAt)?.getTime() || 0))
    .slice(-8)
    .map((item) => ({ label: item.label || item.type || "Assessment", value: Number(item.score || 0) }));
  const attendanceRate = attendance.length
    ? Math.round((attendance.filter((item) => item.status === "present" || item.status === "late").length / attendance.length) * 100)
    : 0;

  return {
    averageGrade: average(assessments.map((item) => item.score)),
    averageCompletion: average(enrollments.map((item) => item.completionPercentage)),
    attendanceRate,
    scoreByType,
    weekly,
    completion: enrollments.map((item) => ({ label: item.course?.title || "Course", value: Number(item.completionPercentage || 0) }))
  };
};

export const getInstructorDashboardData = async () => {
  const [students, enrollments, courses, assessments, activities] = await Promise.all([
    getCollection("users", [where("role", "==", "student")]),
    getCollection("enrollments"),
    getCollection("courses"),
    getCollection("assessments"),
    getCollection("activities", [limit(30)])
  ]);
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const assessmentByStudent = assessments.reduce((map, assessment) => {
    const current = map.get(assessment.studentId) || [];
    current.push(assessment);
    map.set(assessment.studentId, current);
    return map;
  }, new Map());
  const enrollmentByStudent = enrollments.reduce((map, enrollment) => {
    const current = map.get(enrollment.studentId) || [];
    current.push({ ...enrollment, course: courseMap.get(enrollment.courseId) || null });
    map.set(enrollment.studentId, current);
    return map;
  }, new Map());
  const rows = students.map((student) => {
    const studentEnrollments = enrollmentByStudent.get(student.id) || [];
    const studentAssessments = assessmentByStudent.get(student.id) || [];
    const attendanceValues = studentEnrollments.map((item) => Number(item.attendancePercentage || 0)).filter(Boolean);
    return {
      ...student,
      enrollments: studentEnrollments,
      courses: studentEnrollments.map((item) => item.course?.title).filter(Boolean),
      completionPercentage: average(studentEnrollments.map((item) => item.completionPercentage)),
      gradeAverage: average(studentAssessments.map((item) => item.score)),
      attendancePercentage: average(attendanceValues),
      status: student.status || "active"
    };
  });

  return {
    students: rows,
    courses,
    enrollments,
    assessments,
    activities: sortByDateDesc(activities, "createdAt").slice(0, 6)
  };
};

export const updateUserProfile = async (uid, values) => {
  assertFirebaseReady();
  await updateDoc(doc(db, "users", uid), { ...values, updatedAt: serverTimestamp() });
};

export const updateUserPreferences = async (uid, preferences) => updateUserProfile(uid, { preferences });
