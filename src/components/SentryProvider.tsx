import * as Sentry from '@sentry/react-native';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, DeviceEventEmitter, StyleSheet} from 'react-native';

import {DSN} from '../config';
import {SE} from '@env';

// Intercept global errors BEFORE Sentry initializes so Sentry can wrap our
// handler and pass the error down to it.
const globalAny = global as any;
if (globalAny.ErrorUtils) {
  const defaultHandler = globalAny.ErrorUtils.getGlobalHandler();
  globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    // Manually capture the global error to Sentry since we disabled its native
    // 'onerror' handler. This allows us to report multiple fatal errors if the
    // user recovers the app via Fallback UI.
    Sentry.withScope(scope => {
      if (isFatal) {
        scope.setLevel('fatal');
      }
      scope.addEventProcessor(event => {
        if (event.exception?.values?.[0]) {
          return {
            ...event,
            exception: {
              ...event.exception,
              values: [
                {
                  ...event.exception.values[0],
                  mechanism: {
                    ...event.exception.values[0].mechanism,
                    handled: false,
                    type: 'onerror',
                  },
                },
                ...event.exception.values.slice(1),
              ],
            },
          };
        }
        return event;
      });
      Sentry.captureException(error);
    });

    // Emit an event to SentryProvider to show the Fallback UI
    DeviceEventEmitter.emit('GLOBAL_UNHANDLED_ERROR', error);

    // In development, still show the React Native Redbox for the stack trace.
    // In production, skip the default handler to prevent the app from crashing.
    if (__DEV__) {
      defaultHandler(error, isFatal);
    }
  });
}

export const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  routeChangeTimeoutMs: 500,
  enableTimeToInitialDisplay: true,
});

const packageJson = require('../../package.json');

Sentry.init({
  dsn: DSN,
  debug: true,
  environment: 'dev',
  enableLogs: true,
  beforeSend: event => {
    if (SE === 'tda') {
      event.fingerprint = ['{{ default }}', SE, packageJson.version];
    } else if (SE) {
      event.fingerprint = ['{{ default }}', SE];
    }
    return event;
  },
  integrations: [
    Sentry.reactNativeErrorHandlersIntegration({
      onerror: false, // We manually handle global errors above
    }),
    Sentry.reactNativeTracingIntegration({
      traceFetch: false,
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
  sessionTrackingIntervalMillis: 5000,
  maxBreadcrumbs: 150,
  attachStacktrace: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  spotlight: true,
});

Sentry.setTag('se', SE);

const SentryFallback = ({resetError}: {resetError: () => void}) => {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackCard}>
        <Text style={styles.fallbackTitle}>Oops! Something went wrong.</Text>
        <Text style={styles.fallbackBody}>
          We're sorry, but an unexpected error has occurred. Our team has been
          notified.
        </Text>
        <View style={styles.fallbackActions}>
          <Pressable
            style={[styles.fallbackButton, styles.fallbackButtonOutline]}
            onPress={resetError}>
            <Text style={styles.fallbackButtonTextOutline}>Go to Home</Text>
          </Pressable>
          <Pressable
            style={[styles.fallbackButton, styles.fallbackButtonPrimary]}
            onPress={resetError}>
            <Text style={styles.fallbackButtonTextPrimary}>Restart</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const SentryProvider = ({children}: {children: React.ReactNode}) => {
  const [globalError, setGlobalError] = useState<Error | null>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'GLOBAL_UNHANDLED_ERROR',
      (error: Error) => {
        setGlobalError(error);
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const resetGlobalError = () => {
    setGlobalError(null);
  };

  // If a global JS exception occurred, render the fallback UI over everything
  if (globalError) {
    return <SentryFallback resetError={resetGlobalError} />;
  }

  // Fallback to Sentry's native boundary for render-phase errors
  return (
    <Sentry.ErrorBoundary fallback={SentryFallback}>{children}</Sentry.ErrorBoundary>
  );
};

export default Sentry.wrap(SentryProvider);

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  fallbackCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  fallbackTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    color: '#000',
  },
  fallbackBody: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    fontSize: 15,
  },
  fallbackActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  fallbackButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackButtonOutline: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  fallbackButtonPrimary: {
    marginLeft: 8,
    backgroundColor: '#002626',
  },
  fallbackButtonTextOutline: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fallbackButtonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
