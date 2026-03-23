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
import Toast from 'react-native-toast-message';

import {RootState, store} from './reduxApp';
import {SE} from '@env'; // SE is undefined if no .env file is set
import {RootStackParamList} from './navigation';
import SentryProvider, {reactNavigationIntegration} from './components/SentryProvider';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LogBox, Platform, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SentryUserFeedbackActionButton} from './components/UserFeedbackModal';
console.log('> SE', SE);

LogBox.ignoreAllLogs();

// Sentry.init has been moved to SentryProvider.tsx
// const reactNavigationIntegration = Sentry.reactNavigationIntegration({ ... });
// const packageJson = require('../package.json');
// Sentry.init({ ... });
// Sentry.setTag('se', SE);

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
    <SentryProvider>
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
    </SentryProvider>
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
});

export default App;
