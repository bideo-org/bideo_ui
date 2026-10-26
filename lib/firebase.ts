import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const apiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyD_placeholder_key_for_prerender";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "buzzclips-prod";

const firebaseConfig = {
  apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:buzzclipsapp",
};

// Initialize Firebase app if not already initialized
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { signInWithPopup } from "firebase/auth";
