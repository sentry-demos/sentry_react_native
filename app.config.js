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
  },
  android: {
    package: 'com.sentry_react_native',
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
