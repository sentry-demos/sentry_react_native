import * as React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import * as Sentry from '@sentry/react-native';

// The Empower Plant React web app. Its `@sentry/react` continues a trace from the
// `sentry-trace` / `baggage` <meta> tags that `sentryWebViewProps` injects, so the
// web pageload (and the backend calls it makes) join this app's trace.
const WEB_STORE_HOST = 'empower-plant.com';

// Open `/products` (not `/`) so the products page *is* the web pageload: only the
// pageload continues the injected trace, and it fetches /products from the backend,
// giving one RN -> React -> backend trace.
const WEB_STORE_PATH = '/products';

const buildWebStoreUrl = (): string => {
  const params: Record<string, string> = {backend: 'flask'};

  const se = process.env.EXPO_PUBLIC_SE;
  if (se) {
    params.se = se;
  }

  // Reuse the RN app's random user so web events are attributed to the same user.
  const email = Sentry.getCurrentScope().getUser()?.email;
  if (email) {
    params.userEmail = email;
  }

  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `https://${WEB_STORE_HOST}${WEB_STORE_PATH}?${query}`;
};

const WebStoreScreen = () => {
  // A dedicated transaction spanning the WebView load. It's the parent the web
  // pageload continues from, so the trace waterfall shows the web page nested
  // under the time the app spent loading it. Created once per mount.
  const [loadSpan] = React.useState(() =>
    Sentry.startInactiveSpan({
      name: 'webview/empower-plant',
      op: 'ui.webview.load',
      forceTransaction: true,
      attributes: {url: `https://${WEB_STORE_HOST}${WEB_STORE_PATH}`},
    }),
  );

  // Computed once, with the load span active, so the injected `sentry-trace`
  // points at it. Must not change across re-renders.
  const [{uri, sentryProps}] = React.useState(() => ({
    uri: buildWebStoreUrl(),
    sentryProps: Sentry.withActiveSpan(loadSpan, () =>
      Sentry.sentryWebViewProps({allowedHosts: [WEB_STORE_HOST]}),
    ),
  }));

  const endLoadSpan = React.useCallback(
    (status?: 'ok' | 'internal_error') => {
      // Ends once; later page loads (e.g. a full navigation inside the page) no-op.
      if (!loadSpan.isRecording()) {
        return;
      }
      // Span status codes: 1 = ok, 2 = error.
      loadSpan.setStatus(
        status === 'internal_error'
          ? {code: 2, message: 'internal_error'}
          : {code: 1},
      );
      loadSpan.end();
    },
    [loadSpan],
  );

  // Fallback: end the span if the user leaves before the page finishes loading.
  React.useEffect(() => () => endLoadSpan(), [endLoadSpan]);

  return (
    // Tabs have no header here, so keep the page clear of the status bar.
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        testID="webview-store"
        source={{uri}}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#002626" />
          </View>
        )}
        // Spread first: it provides the trace injection and the `onMessage` that
        // Android needs for injected JS to run. Never override
        // `injectedJavaScriptBeforeContentLoaded` after it.
        {...sentryProps}
        onLoadEnd={() => endLoadSpan()}
        onError={() => endLoadSpan('internal_error')}
        onHttpError={() => endLoadSpan('internal_error')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WebStoreScreen;
