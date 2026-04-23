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

import HomeScreen from './screens/HomeScreen';
import ListApp from './screens/ListApp';
import TrackerScreen from './screens/TrackerScreen';
import ManualTrackerScreen from './screens/ManualTrackerScreen';
import PerformanceTimingScreen from './screens/PerformanceTimingScreen';
import EndToEndTestsScreen from './screens/EndToEndTestsScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ReduxScreen from './screens/ReduxScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';

import {RootState, store} from './reduxApp';
import {SE} from '@env'; // SE is undefined if no .env file is set
import {RootStackParamList} from './navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LogBox, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SentryUserFeedbackActionButton} from './components/UserFeedbackModal';
import {DSN} from './config';
console.log('> SE', SE);

LogBox.ignoreAllLogs();

const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  routeChangeTimeoutMs: 500,
  enableTimeToInitialDisplay: true,
});

const packageJson = require('../package.json');

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

const FallbackComponent = ({resetError}: {resetError: () => void}) => (
  <View style={styles.fallback}>
    <Text style={styles.fallbackText}>Something went wrong.</Text>
    <Pressable style={styles.fallbackButton} onPress={resetError}>
      <Text style={styles.fallbackButtonText}>Refresh</Text>
    </Pressable>
  </View>
);

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator<RootStackParamList>();

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
  });

  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
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
            <BottomTabNavigator />
            {/* <Toast /> */}
            <SentryUserFeedbackActionButton />
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
    </Sentry.ErrorBoundary>
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
              testID="bottom-tab-cart"
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
              name="gear"
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
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
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
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fallbackText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#000',
  },
  fallbackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#002626',
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Sentry.wrap(App);
