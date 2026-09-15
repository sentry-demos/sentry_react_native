const packageJson = require('./package.json');

module.exports = {
  name: 'sentry_react_native',
  slug: 'sentry_react_native',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // iOS bundle identifiers can't contain underscores, unlike the Android package name below.
    bundleIdentifier: 'com.sentry-react-native',
    // Continues the build number sequence from the pre-Expo app, which was at 19.
    buildNumber: '20',
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
    versionCode: 20,
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
