import { initializeApp, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let initError: Error | null = null;

function getFirebaseConfig(): FirebaseConfig {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Configuração do Firebase ausente: ${missing.join(", ")}`);
  }

  return config as FirebaseConfig;
}

function getAppInstance() {
  if (app) {
    return app;
  }
  if (initError) {
    throw initError;
  }

  try {
    const firebaseConfig = getFirebaseConfig();
    app = initializeApp(firebaseConfig);
    return app;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar Firebase";
    initError = new Error(errorMessage);
    throw initError;
  }
}

function buildAuth(appInstance: FirebaseApp) {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;

    return initializeAuth(appInstance, {
      // @ts-ignore
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (err) {
    console.warn(
      "[firebase/auth] Não foi possível configurar persistência. " +
      "Instale @react-native-async-storage/async-storage para manter o login."
    );

    return getAuth(appInstance);
  }
}

function getAuthInstance() {
  if (authInstance) {
    return authInstance;
  }
  if (initError) {
    throw initError;
  }

  try {
    authInstance = buildAuth(getAppInstance());
    return authInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar auth";
    initError = new Error(errorMessage);
    throw initError;
  }
}

function getDbInstance() {
  if (dbInstance) {
    return dbInstance;
  }
  if (initError) {
    throw initError;
  }

  try {
    dbInstance = getFirestore(getAppInstance());
    return dbInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar Firestore";
    initError = new Error(errorMessage);
    throw initError;
  }
}

function getFirebaseInitError() {
  return initError;
}

export { getAuthInstance, getDbInstance, getFirebaseInitError };
