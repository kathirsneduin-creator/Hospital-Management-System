// Firebase configuration
// Fill in your project credentials in a `.env` file at the project root
// (copy `.env.example` to `.env` first). See README.md → "Firebase Setup".
//
// IMPORTANT: this file is written defensively on purpose. If `.env` is missing
// or has placeholder values, Firebase's own SDK throws the moment `getAuth()`
// / `getFirestore()` is called — and because this module is imported at the
// very top of the app, that throw would previously blank out the ENTIRE site
// with no visible error. Now, if Firebase isn't configured yet, we log a
// clear console warning and export `null` instead of crashing, so the public
// pages (Home, Programs, About, etc.) still render normally. Only the
// login/dashboard features require real Firebase credentials.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    // Invalid credentials (e.g. wrong API key) — fail soft instead of blanking the site.
    console.error(
      '[Firebase] Failed to initialize with the values in your .env file. ' +
      'Double-check them in the Firebase Console → Project Settings. ' +
      'The public site will still work; login/dashboards will not until this is fixed.',
      err
    );
    app = null; auth = null; db = null; storage = null;
  }
} else {
  console.warn(
    '[Firebase] No .env file (or missing values) detected — running in demo mode. ' +
    'Copy .env.example to .env and fill in your Firebase project config to enable ' +
    'login, registration, and the dashboards. See README.md → "Firebase Setup".'
  );
}

export { auth, db, storage, firebaseConfig };
export default app;
