import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import {RootStackParamList} from '../navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CartNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

export default CartNavigator;
