import * as React from 'react';
import {Provider} from 'react-redux';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';

// Import the Sentry React Native SDK
import * as Sentry from '@sentry/react-native';

import Toast from 'react-native-toast-message';

import {store, showFeedbackActionButton} from './reduxApp';
import {DSN} from './config';
import {SE} from '@env'; // SE is undefined if no .env file is set
import RootTabNavigator from './navigators/RootTabNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LogBox, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SentryUserFeedbackActionButton} from './components/UserFeedbackModal';
console.log('> SE', SE);

LogBox.ignoreAllLogs();

const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  // How long it will wait for the route change to complete. Default is 1000ms
  routeChangeTimeoutMs: 500,
  enableTimeToInitialDisplay: true,
});

// Get app version from package.json, for fingerprinting
const packageJson = require('../package.json');

Sentry.init({
  dsn: DSN,
  debug: true,
  environment: 'dev',
  enableLogs: true,
  beforeSend: (event) => {
    if (SE === 'tda') {
      // Make issues unique to the release (app version) for Release Health
      event.fingerprint = ['{{ default }}', SE, packageJson.version];
    } else if (SE) {
      // Make issue for the SE
      event.fingerprint = ['{{ default }}', SE];
    }

    if (!event.type) {
      // Only show the feedback button for errors
      store.dispatch(showFeedbackActionButton());
    }

    return event;
  },
  integrations: [
    Sentry.reactNativeTracingIntegration({
      traceFetch: false, // RN uses XHR to implement fetch, this prevents duplicates
    }),
    Sentry.mobileReplayIntegration({
      maskAllImages: true,
      maskAllText: true,
    }),
    Sentry.consoleLoggingIntegration({levels: ['log', 'warn', 'error']}),
    reactNavigationIntegration,
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  enableUserInteractionTracing: true,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 5000, // For testing, session close when 5 seconds (instead of the default 30) in the background.
  maxBreadcrumbs: 150, // Extend from the default 100 breadcrumbs.
  attachStacktrace: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  spotlight: true,
});

Sentry.setTag('se', SE);

const App = () => {
  const navigation = React.useRef<NavigationContainerRef<[]> | null>(null);

  const scope = Sentry.getCurrentScope();
  const customerType = [
    'medium-plan',
    'large-plan',
    'small-plan',
    'enterprise',
  ][Math.floor(Math.random() * 4)];
  scope.setTag('customerType', customerType);
  let email = Math.random().toString(36).substring(2, 6) + '@yahoo.com';
  scope.setUser({email: email});

  // Log app initialization
  Sentry.logger.info('App initialized', {
    customerType,
    email,
    se: SE,
    version: packageJson.version,
  });

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.gestureHandlerRootView}>
          <NavigationContainer
            ref={navigation}
            onReady={() => {
              reactNavigationIntegration.registerNavigationContainer(
                navigation,
              );
              Sentry.logger.info('Navigation container ready');
            }}>
            <RootTabNavigator />
            {/* <Toast /> */}
            <SentryUserFeedbackActionButton />
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
});

export default Sentry.wrap(App, {
  touchEventBoundaryProps: {
    ignoreNames: ['Provider', 'UselessName', /^SomeRegex/],
    labelName: 'id',
  },
});
