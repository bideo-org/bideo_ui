import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth, signInWithPopup } from "firebase/auth";
import { api_instance } from "@/global";
import {
  DEFAULT_FIREBASE_PROJECT_ID,
  DEFAULT_FIREBASE_AUTH_DOMAIN,
} from "@/constants/firebase";

interface FirebaseClientConfig {
  apiKey: string;
  projectId: string;
  authDomain: string;
  appId?: string;
}

let cachedConfig: FirebaseClientConfig | null = null;
let clientApp: FirebaseApp | null = null;
let clientAuth: Auth | null = null;
let clientProvider: GoogleAuthProvider | null = null;

export async function fetchFirebaseConfig(): Promise<FirebaseClientConfig> {
  if (cachedConfig) return cachedConfig;

  let apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  let authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  let appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // 1. Fetch live config from backend /api/app/auth/config
  try {
    const res = await fetch(`${api_instance}/app/auth/config`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey && data.apiKey.trim().length > 0) {
        apiKey = data.apiKey.trim();
      }
      if (data.projectId && data.projectId.trim().length > 0) {
        projectId = data.projectId.trim();
      }
      if (data.authDomain && data.authDomain.trim().length > 0) {
        authDomain = data.authDomain.trim();
      }
      if (data.appId && data.appId.trim().length > 0) {
        appId = data.appId.trim();
      }
    }
  } catch (err) {
    console.warn("Could not retrieve Firebase config from backend:", err);
  }

  // Ensure projectId and authDomain are NEVER empty (prevents auth/auth-domain-config-required)
  const resolvedProjectId =
    projectId && projectId.trim().length > 0
      ? projectId.trim()
      : DEFAULT_FIREBASE_PROJECT_ID;

  const resolvedAuthDomain =
    authDomain && authDomain.trim().length > 0
      ? authDomain.trim()
      : (resolvedProjectId
          ? `${resolvedProjectId}.firebaseapp.com`
          : DEFAULT_FIREBASE_AUTH_DOMAIN);

  if (!apiKey || apiKey.startsWith("AIzaSyD_placeholder")) {
    throw new Error(
      "Firebase Web API Key is not configured on deploy infra or backend"
    );
  }

  cachedConfig = {
    apiKey: apiKey.trim(),
    projectId: resolvedProjectId,
    authDomain: resolvedAuthDomain,
    appId: appId ? appId.trim() : undefined,
  };

  return cachedConfig;
}

export async function getFirebaseAuth(): Promise<{
  auth: Auth;
  googleProvider: GoogleAuthProvider;
}> {
  if (clientAuth && clientProvider) {
    return { auth: clientAuth, googleProvider: clientProvider };
  }

  const config = await fetchFirebaseConfig();

  const existingApps = getApps();
  clientApp = existingApps.length > 0 ? getApp() : initializeApp(config);
  clientAuth = getAuth(clientApp);

  clientProvider = new GoogleAuthProvider();
  clientProvider.setCustomParameters({ prompt: "select_account" });
  return { auth: clientAuth, googleProvider: clientProvider };
}

export const getLiveFirebaseAuth = getFirebaseAuth;

// Fallback exports for components or tests that directly import auth/googleProvider
export const auth: Auth = (
  getApps().length > 0 ? getAuth(getApp()) : undefined
) as any;
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
