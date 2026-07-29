# Firestore schema

EduTrack Pro reads every learner, course, grade, attendance, and activity value from Firestore. The browser application deliberately does not contain demo learners or course records.

## Required collections

| Collection | Document ID | Purpose | Required fields |
| --- | --- | --- | --- |
| `users` | Firebase Authentication UID | Role and profile source of truth | `role`, `displayName`, `email` |
| `courses` | Course ID | Course catalog details | `title`, `instructorName`, `modulesTotal` |
| `enrollments` | Any stable ID | Student/course progress relationship | `studentId`, `courseId`, `completionPercentage`, `modulesCompleted`, `modulesTotal` |
| `assessments` | Any stable ID | Quiz and assignment score history | `studentId`, `courseId`, `type`, `score`, `submittedAt` |
| `attendance` | Any stable ID | Per-date attendance records | `studentId`, `courseId`, `date`, `status` |
| `activities` | Any stable ID | Recent dashboard activity stream | `userId`, `title`, `description`, `createdAt` |

The field-level template is in [data/firestore-schema.example.json](../data/firestore-schema.example.json). Replace every descriptive value with real records in the Firebase console or a trusted administrative import process.

## Provisioning sequence

1. Create the account in Firebase Authentication with Email/Password.
2. Copy its Firebase Authentication UID.
3. Create `users/{uid}` using that exact UID and set `role` to either `student` or `instructor`.
4. Create course documents, then create enrollment, assessment, attendance, and activity documents referencing the student UID and course document ID.
5. Sign in using the matching account and role. The role selector is verified against `users/{uid}.role`.

## Data behavior in the UI

- Student dashboards query only documents whose `studentId` matches the signed-in UID.
- Instructor dashboards read learner documents and aggregate course, enrollment, and assessment values in the browser.
- Activity is sorted by its `createdAt` timestamp in the browser. This avoids a compound index requirement for the supplied schema.
- `attendancePercentage` is a cached enrollment-level aggregate for instructor tables; student analytics calculates attendance from the detailed `attendance` collection.

## Scaling note

The provided implementation is suitable for a course-size learner cohort. At a larger organization scale, add trusted server-side aggregate maintenance (for example, a Firebase Cloud Function) and instructor-scoped summary documents. That is intentionally outside this frontend-only specification.
