import * as React from 'react';
import {Button, View, StyleSheet, Text, FlatList} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import {RootState} from '../reduxApp';
import {BACKEND_URL} from '../config';
import {RootStackParamList} from '../navigation';
import {StackScreenProps} from '@react-navigation/stack';
import {ProfiledStyledCartProductCard} from '../components/StyledCartProductCard';
import { Product } from '../types/Product';

interface CartData {
  name: string;
  imgcropped: string;
  id: number;
  price: number;
  quantity: number;
}
interface subTotal {
  quantity: number;
  total: number;
}
export type UIToast = typeof Toast;

const CheckoutButton = ({
  navigation,
}: Pick<StackScreenProps<RootStackParamList>, 'navigation'>) => {
  return (
    <Button
      onPress={() => {
        navigation.navigate('Checkout');
      }}
      title="Checkout"
    />
  );
};

const computeCartTotal = (cartItems: Array<CartData>): subTotal => {
  let total = 0;
  let quantity = 0;
  cartItems.map((item) => {
    quantity = +item.quantity;
    let itemTotal = item.quantity * item.price;
    total += itemTotal;
  });
  let aggregate = {total, quantity};
  return aggregate;
};

const CartScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, 'Cart'>) => {
  const dispatch = useDispatch();
  const cartData = useSelector((state: RootState) => state.cart);
  const [_, setOrderStatusUI] = React.useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRightContainerStyle: {paddingRight: 20},
      headerRight: () => <CheckoutButton navigation={navigation} />,
    });
  }, [navigation]);

  const cartItems: Array<CartData> | [] = Object.values(cartData);
  const subTotalDisplay = (props: subTotal): React.ReactElement => {
    const {quantity: q, total: t} = props;
    const multiple = q > 1 ? 's' : '';
    return (
      <Text style={styles.subtotalText}>
        {`Subtotal (${q} item${multiple}): $${t}`}
      </Text>
    );
  };

  //TODO: This looks like it should be used
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const placeOrder = async (
    uiToast: null | UIToast = null,
  ): Promise<Response> => {
    setOrderStatusUI(true);
    const data = {cart: Object.values(cartData)};
    let response = await fetch(`${BACKEND_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        email: 'test@sentry.io',
      },
      body: JSON.stringify(data),
    }).catch((err) => {
      throw new Error(err);
    });
    setOrderStatusUI(false);
    if (response.status !== 200) {
      uiToast
        ? uiToast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Error: Could not place order.',
          })
        : null;

      Sentry.captureException(
        new Error(
          response.status +
            ' - ' +
            (response.statusText || ' INTERNAL SERVER ERROR'),
        ),
      );
    } else {
      uiToast
        ? uiToast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Request Succeeded',
          })
        : null;
    }
    return response;
  };

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/success`); // exists just to add span data to demo
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.titleContainer}>
        <View>
          {cartItems.length === 0 ? (
            <Text>No items in cart</Text>
          ) : (
            subTotalDisplay(computeCartTotal(cartItems))
          )}
        </View>
      </View>
      <View>
        <FlatList
          contentContainerStyle={styles.contentContainer}
          data={Object.values(cartData)}
          renderItem={({item}) => {
            return (
              <ProfiledStyledCartProductCard
                appDispatch={dispatch}
                quantity={item.quantity}
                title={item.title}
                imgcropped={item.imgcropped}
                id={item.id}
                // type={""}
                price={item.price}
              />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};
export default Sentry.withProfiler(CartScreen);

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 165,
  },
  screen: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffff',
  },
  titleContainer: {
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  subtotalText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
});
