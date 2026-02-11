import Constants from 'expo-constants';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const expoExtra =
  Constants.expoConfig?.extra ??
  Constants.manifest2?.extra?.expoClient?.extra ??
  {};

const readString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// Use direct EXPO_PUBLIC_* references so Expo can statically inline them.
const firebaseConfig: FirebaseConfig = {
  apiKey:
    readString(process.env.EXPO_PUBLIC_FIREBASE_API_KEY) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain:
    readString(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId:
    readString(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket:
    readString(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId:
    readString(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId:
    readString(process.env.EXPO_PUBLIC_FIREBASE_APP_ID) ||
    readString(expoExtra.EXPO_PUBLIC_FIREBASE_APP_ID),
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const hasPlaceholderValues = Object.values(firebaseConfig).some(
  (value) => value.includes('...') || value.toLowerCase().includes('your-') || value.includes('YOUR_'),
);

const hasInvalidApiKeyFormat = !/^AIza[\w-]{35}$/.test(firebaseConfig.apiKey);

if (missingKeys.length > 0 || hasPlaceholderValues || hasInvalidApiKeyFormat) {
  const details = [
    missingKeys.length ? `missing: ${missingKeys.join(', ')}` : null,
    hasPlaceholderValues ? 'placeholder values detected' : null,
    hasInvalidApiKeyFormat ? 'apiKey format invalid (must be a real Firebase Web API key)' : null,
  ]
    .filter(Boolean)
    .join('; ');

  throw new Error(
    `Firebase config is invalid (${details}). Populate EXPO_PUBLIC_FIREBASE_* in .env and restart Expo with cache clear (npx expo start -c).`,
  );
}

const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
