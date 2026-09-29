# Troubleshooting

## Metro bundler issues

```bash
# Clear Metro cache
npx expo start --clear
```

## Dependency issues

```bash
rm -rf node_modules
npm install
```

## iOS Simulator

```bash
npm run ios
```

### Build fails with "'weak' must be a mutable variable"

Expo SDK 57 needs **Xcode 26.4 or newer**. The failure comes from
`node_modules/expo-modules-jsi`, whose Swift sources use `weak let` — valid only
from Swift 6.3 (Xcode 26.4). On Xcode 26.1 the build dies with ~15 of these
errors while building the `ExpoModulesJSI` xcframework.

Update Xcode, then clear the stale framework before rebuilding:

```bash
rm -rf node_modules/expo-modules-jsi/apple/Products ios
npx expo prebuild --platform ios
npm run ios
```

Don't patch the `weak let` declarations — it hides the real cause and breaks in CI.

## Android Emulator

Make sure Android emulator has internet access enabled (AVD Manager).

```bash
npm run android
```

## Sentry source maps not uploading

Ensure `SENTRY_AUTH_TOKEN` is set in your environment before a release build:

```bash
export SENTRY_AUTH_TOKEN=<your_token>
```

The token needs access to the org and project configured in `app.config.js`
(`demo` / `mobile-react-native`). A token scoped to a different org fails the
`createBundleRelease...SentryUpload` Gradle task with `error: organization not found`.

## Environment variable not working

Expo only exposes variables prefixed with `EXPO_PUBLIC_` to app code. Use `.env.local`:

```
EXPO_PUBLIC_SE=tda
```

Then restart the Metro bundler (`npm start -- --clear`).

## Bootstrapping a new Expo app with Sentry

```bash
npx create-expo-app@latest my_app --template blank-typescript
cd my_app
npx expo install @sentry/react-native
```

The `npx expo install @sentry/react-native` command automatically adds the Sentry config plugin to `app.json`.
