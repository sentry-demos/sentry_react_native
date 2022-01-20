import * as React from 'react';
import {Provider} from 'react-redux';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// Import the Sentry React Native SDK
import * as Sentry from '@sentry/react-native';

import HomeScreen from './screens/HomeScreen';
import TrackerScreen from './screens/TrackerScreen';
import ManualTrackerScreen from './screens/ManualTrackerScreen';
import PerformanceTimingScreen from './screens/PerformanceTimingScreen';
import EndToEndTestsScreen from './screens/EndToEndTestsScreen';
import ReduxScreen from './screens/ReduxScreen';
import EmpowerPlant from './screens/EmpowerPlant';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import Toast from 'react-native-toast-message';

import {store} from './reduxApp';
import {DSN} from './config';
import {SE} from '@env'; // SE is undefined if no .env file is set

const reactNavigationV5Instrumentation = new Sentry.ReactNavigationV5Instrumentation(
  {
    // How long it will wait for the route change to complete. Default is 1000ms
    routeChangeTimeoutMs: 500, 
  },
);

// Get app version from package.json, for fingerprinting
const packageJson = require('../package.json');

Sentry.init({
  dsn: DSN,
  environment: "dev",
  beforeSend: (event) => {
    if (SE === "tda") {
      // Make issues unique to the release (app version) for Release Health
      event.fingerprint = ['{{ default }}', SE, packageJson.version ];
    } else if (SE) {
      // Make issue for the SE
      event.fingerprint = ['{{ default }}', SE ];
    }
    return event; 
  },
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation: reactNavigationV5Instrumentation,
      tracingOrigins: ['localhost', /^\//, /^https:\/\//]
      // How to ignore transactions for the "Manual Tracker" screen
      // beforeNavigate: (context: Sentry.ReactNavigationTransactionContext) => {
      //   if (context.data.route.name === 'ManualTracker') {
        //     context.sampled = false;
        //   }
        //   return context;
        // },
      // idleTimeout: 5000
    }),
  ],
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true, // For testing, session close when 5 seconds (instead of the default 30) in the background.
  sessionTrackingIntervalMillis: 5000, 
  maxBreadcrumbs: 150, // Extend from the default 100 breadcrumbs.
  // debug: true
});

Sentry.setTag('se', SE);

const Stack = createStackNavigator();

const App = () => {
  const navigation = React.useRef();
  

  return (
    <Provider store={store}>
      <NavigationContainer
        ref={navigation}
        onReady={() => {
          reactNavigationV5Instrumentation.registerNavigationContainer(
            navigation,
          );
        }}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Tracker" component={TrackerScreen} />
          <Stack.Screen name="ManualTracker" component={ManualTrackerScreen} />
          <Stack.Screen
            name="PerformanceTiming"
            component={PerformanceTimingScreen}
          />
          <Stack.Screen name="Redux" component={ReduxScreen} />
          <Stack.Screen name="EndToEndTests" component={EndToEndTestsScreen} />
          <Stack.Screen name="Products" component={EmpowerPlant} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    </Provider>
  );
};

export default Sentry.withTouchEventBoundary(App, {
  ignoreNames: ['Provider', 'UselessName', /^SomeRegex/],
});