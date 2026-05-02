import * as React from 'react';
import {LogBox, StyleSheet} from 'react-native';

import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {SE} from '@env'; // SE is undefined if no .env file is set
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {SentryUserFeedbackActionButton} from './components/UserFeedbackModal';
import {DSN} from './config';
import RootTabNavigator from './navigators/RootTabNavigator';
import {showFeedbackActionButton, store} from './reduxApp';

// Use app version for fingerprinting
const packageJson = require('../package.json');

console.log('> SE', SE);

LogBox.ignoreAllLogs();

// ---------------------------------------------------------------------------
// Sentry initialization
// ---------------------------------------------------------------------------

const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  // How long it will wait for the route change to complete. Default is 1000ms
  routeChangeTimeoutMs: 500,
  enableTimeToInitialDisplay: true,
});

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

// ---------------------------------------------------------------------------
// User scope seeding
// ---------------------------------------------------------------------------

const CUSTOMER_TYPES = [
  'medium-plan',
  'large-plan',
  'small-plan',
  'enterprise',
] as const;

const randomCustomerType = () =>
  CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];

const randomEmail = () =>
  Math.random().toString(36).substring(2, 6) + '@yahoo.com';

// Seed Sentry's scope with a random user + customer plan once per app launch
// so issues/sessions are attributable. Runs in an effect to avoid re-firing
// on every render of <App />.
const useInitUserScope = () => {
  React.useEffect(() => {
    const customerType = randomCustomerType();
    const email = randomEmail();

    const scope = Sentry.getCurrentScope();
    scope.setTag('customerType', customerType);
    scope.setUser({email});

    Sentry.logger.info('App initialized', {
      customerType,
      email,
      se: SE,
      version: packageJson.version,
    });
  }, []);
};

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

const App = () => {
  const navigation = React.useRef<NavigationContainerRef<[]> | null>(null);

  useInitUserScope();

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
