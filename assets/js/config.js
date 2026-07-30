/**
 * Firebase web configuration.
 *
 * Copy the values from Firebase Console > Project settings > Your apps into
 * this object before deploying. Firebase web API keys identify the project;
 * access is enforced by Firebase Authentication and Firestore rules.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDjjP160f2Y9GxvWaeDpqQN5SybddgwHlY",
  authDomain: "edutrack-pro-57727.firebaseapp.com",
  projectId: "edutrack-pro-57727",
  storageBucket: "edutrack-pro-57727.firebasestorage.app",
  messagingSenderId: "845208821880",
  appId: "1:845208821880:web:af36ef5e5e1abb03fa0d8d"
};

export const appConfig = {
  name: "EduTrack Pro",
  firebaseSdkVersion: "10.12.2",
  defaultTheme: "light",
  pageSize: 8
};

export const isFirebaseConfigured = () =>
  Object.values(firebaseConfig).every((value) => value && !value.startsWith("REPLACE_WITH"));
