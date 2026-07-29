/**
 * Firebase web configuration.
 *
 * Copy the values from Firebase Console > Project settings > Your apps into
 * this object before deploying. Firebase web API keys identify the project;
 * access is enforced by Firebase Authentication and Firestore rules.
 */
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT.firebasestorage.app",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

export const appConfig = {
  name: "EduTrack Pro",
  firebaseSdkVersion: "10.12.2",
  defaultTheme: "light",
  pageSize: 8
};

export const isFirebaseConfigured = () =>
  Object.values(firebaseConfig).every((value) => value && !value.startsWith("REPLACE_WITH"));
