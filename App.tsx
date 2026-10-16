import * as React from 'react';
import {Provider, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator as createStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesome6} from '@expo/vector-icons';

import * as Sentry from '@sentry/react-native';

import HomeScreen from './src/screens/HomeScreen';
import LandingScreen from './src/screens/LandingScreen';
import ListApp from './src/screens/ListApp';
import TrackerScreen from './src/screens/TrackerScreen';
import ManualTrackerScreen from './src/screens/ManualTrackerScreen';
import PerformanceTimingScreen from './src/screens/PerformanceTimingScreen';
import EndToEndTestsScreen from './src/screens/EndToEndTestsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ReduxScreen from './src/screens/ReduxScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import Toast from 'react-native-toast-message';

import {RootState, store, showFeedbackActionButton} from './src/reduxApp';
import {DSN} from './src/config';
import {RootStackParamList} from './src/navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LogBox, Platform, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SentryUserFeedbackActionButton} from './src/components/UserFeedbackModal';

// SE is read from EXPO_PUBLIC_SE environment variable (.env file)
const SE = process.env.EXPO_PUBLIC_SE;
console.log('> SE', SE);

LogBox.ignoreAllLogs();

const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  routeChangeTimeoutMs: 500,
  enableTimeToInitialDisplay: true,
});

const packageJson = require('./package.json');

Sentry.init({
  dsn: DSN,
  debug: true,
  environment: 'dev',
  enableLogs: true,
  beforeSend: (event) => {
    if (SE === 'tda') {
      event.fingerprint = ['{{ default }}', SE, packageJson.version];
    } else if (SE) {
      event.fingerprint = ['{{ default }}', SE];
    }

    if (!event.type) {
      store.dispatch(showFeedbackActionButton());
    }

    return event;
  },
  integrations: [
    Sentry.reactNativeTracingIntegration({
      idleTimeoutMs: 30000,
    }),
    Sentry.consoleLoggingIntegration({levels: ['log', 'warn', 'error']}),
    reactNavigationIntegration,
  ],
  tracesSampleRate: 1.0,
  // UI Profiling. Do NOT also set `profilesSampleRate` (legacy transaction-based
  // profiling): on Android it silently disables UI profiling, and sentry-cocoa 9.x
  // removed transaction-based profiling.
  _experiments: {
    profilingOptions: {
      // Evaluated once per Sentry session, not per trace.
      profileSessionSampleRate: 1.0,
      // Profiler runs while at least one sampled span is active.
      lifecycle: 'trace',
      // Also profile the app launch.
      startOnAppStart: true,
    },
  },
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

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
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
            ref={reactNavigationIntegration.registerNavigationContainer}
            onReady={() => {
              Sentry.logger.info('Navigation container ready');
            }}>
            <Stack.Navigator id={undefined} screenOptions={{headerShown: false}}>
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Main" component={BottomTabNavigator} />
            </Stack.Navigator>
            <SentryUserFeedbackActionButton />
          </NavigationContainer>
          <Toast />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
};

const BottomTabNavigator = () => {
  const cartItemsCount = useSelector(
    (state: RootState) => Object.values(state.cart || {}).length,
  );

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
      }}>
      <Tab.Screen
        name="Shop"
        component={ShopNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Sentry.Unmask>
              <FontAwesome6
                name="store"
                size={30}
                color={focused ? '#f6cfb2' : '#dae3e4'}
              />
            </Sentry.Unmask>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Sentry.Unmask>
              <FontAwesome6
                testID="bottom-tab-cart"
                name="cart-shopping"
                size={30}
                color={focused ? '#f6cfb2' : '#dae3e4'}
              />
            </Sentry.Unmask>
          ),
          tabBarBadge: cartItemsCount || undefined,
        }}
      />
      <Tab.Screen
        name="Debug"
        component={DebugNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Sentry.Unmask>
              <FontAwesome6
                name="gear"
                size={30}
                color={focused ? '#f6cfb2' : '#dae3e4'}
              />
            </Sentry.Unmask>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const CartNavigator = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

const ShopNavigator = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Products" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

const DebugNavigator = () => {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen name="ListApp" component={ListApp} />
      <Stack.Screen name="Tracker" component={TrackerScreen} />
      <Stack.Screen name="ManualTracker" component={ManualTrackerScreen} />
      <Stack.Screen
        name="PerformanceTiming"
        component={PerformanceTimingScreen}
      />
      <Stack.Screen name="Redux" component={ReduxScreen} />
      <Stack.Screen name="EndToEndTests" component={EndToEndTestsScreen} />
    </Stack.Navigator>
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
