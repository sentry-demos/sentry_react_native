import * as React from 'react';
import {
  Button,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {RootState, AppDispatch} from '../reduxApp';
import {selectImage} from './EmpowerPlant';
import {BACKEND_URL} from '../config';
import {RootStackParamList} from '../navigation';
import {StackScreenProps} from '@react-navigation/stack';

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

  const recordFullDisplay = !!cartData;

  return (
    <View style={styles.screen}>
      <Sentry.TimeToInitialDisplay record={true} />
      <Sentry.TimeToFullDisplay record={recordFullDisplay} />
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
              <ProfiledCartItem
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

export const GradientBtn = (props: {
  colors: Array<string>;
  style: any;
  name: string;
  onPress: any;
  progressState: boolean;
  buttonText: any;
}): React.ReactElement => {
  //dependencies for this may also need to be added for android
  //linear gradient colors Array<string> requires 2 colors
  return (
    <TouchableOpacity onPress={props.onPress}>
      <LinearGradient style={props.style} colors={props.colors}>
        {props.progressState ? (
          <ActivityIndicator size="small" color="#404091" />
        ) : (
          <Text style={props.buttonText}>{props.name}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const CartItem = (props: {
  imgcropped: string;
  id: number;
  quantity: number;
  price: number;
  appDispatch: AppDispatch;
  title: string;
}): React.ReactElement => {
  const deleteItem = (id: string) => {
    props.appDispatch({type: 'DELETE_FROM_CART', payload: id});
  };

  return (
    <View style={styles.statisticContainer}>
      <View>{selectImage(props.imgcropped)}</View>
      <View>
        <Text style={styles.itemTitle}>
          {props.title.charAt(0).toUpperCase() + props.title.slice(1)}
        </Text>

        {/* TODO <Text style={styles.sku}>{'sku: ' + props.sku}</Text> */}
        <Text style={styles.itemPrice}>
          {'$' + props.price + ` (${props.quantity})`}
        </Text>
        <GradientBtn
          buttonText={styles.buttonText}
          colors={['#ebebeb', '#b3b3b3']}
          style={styles.deleteBtn}
          name={'Delete'}
          progressState={false}
          onPress={() => deleteItem(props.id.toString())}
        />
      </View>
    </View>
  );
};

const ProfiledCartItem = Sentry.withProfiler(CartItem);

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 165,
  },
  sku: {
    fontSize: 16,
    color: '#002626',
    marginBottom: 10,
  },
  screen: {
    flex: 1,
    flexDirection: 'column',

    backgroundColor: '#ffff',
  },
  flavorContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  logo: {
    width: 20,
    height: 20,
  },
  titleContainer: {
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  tinyImage: {
    width: 100,
    height: 150,
  },
  card: {
    width: '100%',
    height: 240,
    padding: 12,
    borderWidth: 1,
    borderColor: '#79628C',
    borderRadius: 6,

    alignItems: 'center',
    justifyContent: 'center',
  },
  statisticContainer: {
    width: '100%',
    height: 240,
    padding: 12,
    borderBottomWidth: 1,

    borderColor: '#dbdbdb',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statisticTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  statisticCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    height: 40,
    width: 100,
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#808080',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  linearGradient: {
    height: 50,

    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8D6E63',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  itemTitle: {
    marginBottom: 5,
    fontSize: 17,
    fontWeight: '500',
    color: '#002626',
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#002626',
  },
  subtotalText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
});
