import * as React from 'react';
import {Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';

import {RootState} from '../reduxApp';
import CartNavigator from './CartNavigator';
import DebugNavigator from './DebugNavigator';
import ShopNavigator from './ShopNavigator';

const Tab = createBottomTabNavigator();

const RootTabNavigator = () => {
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

export default RootTabNavigator;
