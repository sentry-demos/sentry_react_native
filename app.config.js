const packageJson = require('./package.json');

// The release workflow resolves one date-based version and passes it through the
// environment; local builds fall back to package.json (1.0.0) and the original
// build number. This keeps the native version and the Sentry release in sync.
const version = process.env.VERSION_NAME || packageJson.version;
const versionCode = process.env.VERSION_CODE || '20';

module.exports = {
  name: 'sentry_react_native',
  slug: 'sentry_react_native',
  version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // iOS bundle identifiers can't contain underscores, unlike the Android package name below.
    bundleIdentifier: 'com.sentry-react-native',
    // Date-based build number (YYMMDD) injected by the release workflow.
    buildNumber: String(versionCode),
    infoPlist: {
      // Set here rather than via `name`, which would also rename the generated
      // Xcode project and the .app bundle the release archive is built from.
      CFBundleDisplayName: 'Empower Plant RN',
      // Lets the app reach a flask backend on localhost (see BACKEND_URL in src/config.ts).
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: 'com.sentry_react_native',
    // Date-based version code (YYMMDD) injected by the release workflow.
    versionCode: Number(versionCode),
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      '@sentry/react-native',
      {
        url: 'https://sentry.io/',
        organization: 'demo',
        project: 'mobile-react-native',
      },
    ],
  ],
};
