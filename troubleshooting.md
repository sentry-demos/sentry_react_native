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

## Android Emulator

Make sure Android emulator has internet access enabled (AVD Manager).

```bash
npm run android
```

## Sentry source maps not uploading

Ensure `SENTRY_AUTH_TOKEN` is set in your environment before running EAS builds:

```bash
export SENTRY_AUTH_TOKEN=<your_token>
eas build --platform ios
```

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
