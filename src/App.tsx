import * as React from 'react';
import {Provider, useSelector} from 'react-redux';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator as createStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';

// Import the Sentry React Native SDK
import * as Sentry from '@sentry/react-native';
import {TransactionContext} from '@sentry/types';

import HomeScreen from './screens/HomeScreen';
import ListApp from './screens/ListApp';
import TrackerScreen from './screens/TrackerScreen';
import ManualTrackerScreen from './screens/ManualTrackerScreen';
import PerformanceTimingScreen from './screens/PerformanceTimingScreen';
import EndToEndTestsScreen from './screens/EndToEndTestsScreen';
import ReduxScreen from './screens/ReduxScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import Toast from 'react-native-toast-message';

import {RootState, store} from './reduxApp';
import {DSN} from './config';
import {SE} from '@env'; // SE is undefined if no .env file is set
import {RootStackParamList} from './navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LogBox, Platform, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
console.log('> SE', SE);

LogBox.ignoreAllLogs();

const reactNavigationInstrumentation =
  new Sentry.ReactNavigationInstrumentation({
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
  beforeSend: (event) => {
    if (SE === 'tda') {
      // Make issues unique to the release (app version) for Release Health
      event.fingerprint = ['{{ default }}', SE, packageJson.version];
    } else if (SE) {
      // Make issue for the SE
      event.fingerprint = ['{{ default }}', SE];
    }
    return event;
  },
  integrations: [
    new Sentry.ReactNativeTracing({
      enableUserInteractionTracing: true,

      routingInstrumentation: reactNavigationInstrumentation,
      tracePropagationTargets: ['localhost', /^\//, /^https:\/\//],
      idleTimeout: 15000, // set to prevent spans in the home screen from cancelling prematurely

      // How to ignore transactions for the "Manual Tracker" screen
      beforeNavigate: (context: TransactionContext) => {
        if (context.data?.route.name === 'ManualTracker') {
          context.sampled = false;
        }
        return context;
      },
    }),
  ],
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true, // For testing, session close when 5 seconds (instead of the default 30) in the background.
  sessionTrackingIntervalMillis: 5000,
  maxBreadcrumbs: 150, // Extend from the default 100 breadcrumbs.
  attachStacktrace: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  enableSpotlight: true,
  _experiments: {
    profilesSampleRate: 1,
  },
});

Sentry.setTag('se', SE);

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const navigation = React.useRef<NavigationContainerRef<[]> | null>(null);

  Sentry.configureScope((scope) => {
    const customerType = [
      'medium-plan',
      'large-plan',
      'small-plan',
      'enterprise',
    ][Math.floor(Math.random() * 4)];
    scope.setTag('customerType', customerType);
    let email = Math.random().toString(36).substring(2, 6) + '@yahoo.com';
    scope.setUser({email: email});
  });

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.gestureHandlerRootView}>
          <NavigationContainer
            ref={navigation}
            onReady={() => {
              reactNavigationInstrumentation.registerNavigationContainer(
                navigation,
              );
            }}>
            <BottomTabNavigator />
            <Toast />
          </NavigationContainer>
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
            <Icon
              name="store"
              size={30}
              color={focused ? '#f6cfb2' : '#dae3e4'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="cart-shopping"
              size={30}
              color={focused ? '#f6cfb2' : '#dae3e4'}
            />
          ),
          tabBarBadge: cartItemsCount || undefined,
        }}
      />
      <Tab.Screen
        name="Debug"
        component={DebugNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="bug"
              size={30}
              color={focused ? '#f6cfb2' : '#dae3e4'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const CartNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

const ShopNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const DebugNavigator = () => {
  return (
    <Stack.Navigator>
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
