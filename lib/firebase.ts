import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth, signInWithPopup } from "firebase/auth";
import { api_instance } from "@/global";

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

  // 1. Check if configured in deploy infra / client env
  const envKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const envProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const envDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const envAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (envKey && !envKey.startsWith("AIzaSyD_placeholder")) {
    cachedConfig = {
      apiKey: envKey.trim(),
      projectId: envProject ? envProject.trim() : "",
      authDomain: envDomain ? envDomain.trim() : (envProject ? `${envProject.trim()}.firebaseapp.com` : ""),
      appId: envAppId ? envAppId.trim() : undefined,
    };
    return cachedConfig;
  }

  // 2. Fetch live config from backend /api/app/auth/config
  try {
    const res = await fetch(`${api_instance}/app/auth/config`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey && data.apiKey.trim().length > 0) {
        cachedConfig = {
          apiKey: data.apiKey.trim(),
          projectId: (data.projectId || "").trim(),
          authDomain: (data.authDomain || (data.projectId ? `${data.projectId.trim()}.firebaseapp.com` : "")).trim(),
          appId: data.appId ? data.appId.trim() : undefined,
        };
        return cachedConfig;
      }
    }
  } catch (err) {
    console.error("Failed to fetch Firebase config from backend:", err);
  }

  throw new Error("Firebase Web API Key is not configured on deploy infra or backend");
}

export async function getFirebaseAuth(): Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> {
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
export const auth: Auth = (getApps().length > 0 ? getAuth(getApp()) : undefined) as any;
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
