# SupplyRun (Expo + Firebase)

## Firebase setup

1. Copy `.env.example` to `.env`.
2. Fill in all `EXPO_PUBLIC_FIREBASE_*` values from your Firebase Web app settings.
3. Fill in Google OAuth client IDs for iOS/Android/Web if using Google sign-in.
4. Restart Expo with a clean cache: `npx expo start -c`.

The app now validates config at startup. If a key is missing, placeholder, or malformed, it throws a clear message before Firebase Auth initializes.

### `auth/invalid-api-key` troubleshooting

- Make sure `EXPO_PUBLIC_FIREBASE_API_KEY` is your **real Firebase Web API key** (starts with `AIza`), not the `.env.example` value.
- If you changed `.env`, fully stop Expo and run `npx expo start -c`.
- Confirm the API key belongs to the same Firebase project as your `projectId`/`appId`.

## Firestore structure

Lists are stored at:

- `users/{uid}/lists/{listId}`
  - `title: string`
  - `createdAt: server timestamp`
