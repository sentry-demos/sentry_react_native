import * as React from 'react';
import {useSelector} from 'react-redux';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';

import {RootState} from '../reduxApp';
import {
  TAB_BAR_COLORS,
  TAB_BAR_HEIGHT,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_PADDING_TOP,
} from '../theme/tabBar';
import CartNavigator from './CartNavigator';
import DebugNavigator from './DebugNavigator';
import ShopNavigator from './ShopNavigator';

const Tab = createBottomTabNavigator();

const tabIconColor = (focused: boolean) =>
  focused ? TAB_BAR_COLORS.active : TAB_BAR_COLORS.inactive;

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
          paddingTop: TAB_BAR_PADDING_TOP,
          height: TAB_BAR_HEIGHT,
        },
      }}>
      <Tab.Screen
        name="Shop"
        component={ShopNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="store"
              size={TAB_BAR_ICON_SIZE}
              color={tabIconColor(focused)}
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
              size={TAB_BAR_ICON_SIZE}
              color={tabIconColor(focused)}
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
              size={TAB_BAR_ICON_SIZE}
              color={tabIconColor(focused)}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default RootTabNavigator;
