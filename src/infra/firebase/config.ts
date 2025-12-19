import { initializeApp, FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

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

export const auth = buildAuth(app);
export const db = getFirestore(app);
