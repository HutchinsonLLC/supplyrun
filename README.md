# SupplyRun (Expo + Firebase)

## Firebase setup

1. Copy `.env.example` to `.env`.
2. Fill in all `EXPO_PUBLIC_FIREBASE_*` values from your Firebase Web app settings.
3. Fill in Google OAuth client IDs for iOS/Android/Web if using Google sign-in.
4. Restart Expo (`npm start`) after updating env vars.

If any required Firebase value is missing or still a placeholder, the app now throws a clear startup error listing missing keys.

## Firestore structure

Lists are stored at:

- `users/{uid}/lists/{listId}`
  - `title: string`
  - `createdAt: server timestamp`
