# EduTrack Pro

EduTrack Pro is a production-oriented, responsive Student Progress Tracking SaaS built with **vanilla HTML, CSS, and ES modules**. It uses Firebase Authentication for session management, Firestore for all application data, Tailwind CSS for responsive utilities, and Chart.js for performance visuals.

There is no React, Node.js, TypeScript, jQuery, Bootstrap, or frontend/backend framework in this project.

## What is included

- Email/password sign-in, persistent or session-only login, role verification, password reset, logout, and protected pages.
- Separate student and instructor workspaces.
- Firestore-driven courses, course completion, grades, assessments, attendance, profiles, activity feeds, reports, search, filters, sorting, and pagination.
- Responsive mobile navigation, a student card layout, desktop learner table, dark mode, skeleton loading states, empty states, error cards, and accessible labels/ARIA.
- Chart.js bar, line, and doughnut charts that receive Firestore-derived values.
- Profile preferences and password updates.
- Firebase Hosting configuration, Firestore rules, deployment notes, and a schema template.

## Project structure

```text
.
├── index.html                         # Authentication entry point
├── pages/                             # Protected, role-aware pages
├── assets/
│   ├── css/styles.css                 # Design system additions
│   ├── css/tailwind.input.css          # Tailwind source directives
│   ├── css/tailwind.css                # Production-ready generated Tailwind CSS
│   └── js/
│       ├── config.js                  # Firebase web configuration
│       ├── firebase.js                # Firebase SDK gateway
│       ├── auth.js                    # Authentication + route guard
│       ├── data-service.js            # Firestore reads/updates
│       ├── components.js              # Reusable UI components
│       ├── charts.js                  # Chart.js rendering helpers
│       └── pages/                     # One module per page
├── data/firestore-schema.example.json # Data shape template, not runtime data
├── docs/firestore-schema.md           # Schema and provisioning guide
├── firestore.rules                    # Role-aware Firestore rules
└── firebase.json                      # Firebase Hosting/Firestore config
```

## Firebase setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Add a **Web app** to the project and copy its configuration values.
3. Open [assets/js/config.js](assets/js/config.js) and replace every `REPLACE_WITH_…` value. Do not put private service-account keys in this client-side project.
4. In **Authentication → Sign-in method**, enable **Email/Password**.
5. Create a Cloud Firestore database in production mode.
6. Deploy the included rules before opening the app to users. See the deployment section.
7. Create Authentication users, then create the matching `users/{uid}` documents. The UID must match exactly. Set `role` to `student` or `instructor`.
8. Add course and learner records following [docs/firestore-schema.md](docs/firestore-schema.md). The application has no embedded academic records, so the first dashboard will correctly show empty states until Firestore contains data.

### Minimum profile document

```json
{
  "role": "student",
  "displayName": "Account display name",
  "email": "The same email used in Firebase Authentication",
  "status": "active",
  "preferences": { "notifications": true }
}
```

Use an instructor profile with `"role": "instructor"` for the instructor workspace. See the complete field template in [data/firestore-schema.example.json](data/firestore-schema.example.json).

## Run locally

This is a static website: it has no build, package installation, or Node.js runtime. Tailwind is already compiled into `assets/css/tailwind.css`, so a host only serves files. Serve the project root with any static file server so ES modules load correctly, then open `index.html` through that server. For a Firebase-backed local session, add your local origin to Firebase Authentication’s Authorized domains if Firebase asks for it.

### Updating Tailwind CSS

If you introduce new Tailwind utility classes, rebuild the checked-in stylesheet before deployment. The official standalone Tailwind CLI can do this without Node.js:

```bash
./tailwindcss --input assets/css/tailwind.input.css --output assets/css/tailwind.css --minify
```

The input file already defines the class-based dark-mode variant and scans all HTML and JavaScript templates. Download the matching standalone binary from the [official Tailwind CSS releases](https://github.com/tailwindlabs/tailwindcss/releases) when you need to rebuild.

## Deploy to Firebase Hosting

1. Install the Firebase CLI separately if you do not have it: `npm install -g firebase-tools`.
2. From this directory, run `firebase login` and then `firebase use --add` to select your Firebase project.
3. Deploy Firestore access rules: `firebase deploy --only firestore`.
4. Deploy static hosting: `firebase deploy --only hosting`.

`firebase.json` deploys the static UI and excludes documentation, schema templates, and Word files from the public hosting bundle.

## Deploy to Vercel

1. Import this repository into Vercel or run `vercel` in the project directory.
2. Choose **Other** as the framework preset and leave the build command/output directory empty.
3. Ensure the Firebase configuration in `assets/js/config.js` is complete before deploying.
4. In Firebase Authentication, add your deployed Vercel domain to **Authorized domains**.

No Vercel server function, Node dependency, or rewrite configuration is required; each protected route is a static `.html` entry point.

## Security and data access

`firestore.rules` is deliberately restrictive:

- Students can read their own profile, enrollments, assessments, attendance, and activities.
- Instructors can read student, course, enrollment, assessment, attendance, and activity data for the instructor dashboard.
- Browser users cannot create or change academic records under the included rules.
- Users can update only their own profile and cannot alter their role or email through the UI.

Provision users and learning records through Firebase Console, a trusted admin tool, or a secure backend process. Firestore rules are the security boundary; hiding a page in the browser is not a security control.

## Browser storage

- **Local Storage:** theme choice, sidebar state, and “remember me” preference.
- **Session Storage:** last successful login metadata and current page state.
- **Firebase Authentication:** persistent local session when “Remember me” is enabled, session persistence otherwise.

## Quality notes

The application uses semantic regions, labeled controls, keyboard-visible focus, sufficient text contrast, responsive Tailwind utilities, and `prefers-reduced-motion` support. It uses `textContent`/HTML escaping for Firestore-derived text before rendering it into templates.
