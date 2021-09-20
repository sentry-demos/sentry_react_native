import * as React from 'react';
import {
  Image,
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

interface CartData {
  sku: string;
  name: string;
  // image: string;
  imgcropped: string;
  id: number;
  type: string;
  price: number;
  quantity: number;
}
interface subTotal {
  quantity: number;
  total: number;
}
export type UIToast = typeof Toast;

const CartScreen = (props) => {
  const dispatch = useDispatch();
  const cartData = useSelector((state: RootState) => state.cart);
  const [orderStatusUI, setOrderStatusUI] = React.useState(false);

  const cartItems: Array<CartData> | [] = Object.values(cartData);
  const computeCartTotal = (cartItems: Array<CartData>): subTotal => {
    let aggregate = cartItems.reduce(
      (acc, item) => {
        acc.quantity += item.quantity;
        acc.total += item.price;
        return acc;
      },
      {total: 0, quantity: 0},
    );
    return aggregate;
  };
  const subTotalDisplay = (props: subTotal): React.ReactElement => {
    const {quantity: q, total: t} = props;
    const multiple = q > 1 ? 's' : '';
    return (
      <Text
        style={{
          marginTop: 20,
          marginBottom: 20,
          fontSize: 18,
          fontWeight: '600',
        }}>{`Subtotal (${q} item${multiple}): $${(t / 1000).toFixed(2)}`}</Text>
    );
  };
  const performCheckoutOnServer = async () => {
    // TODO
    // Contact Information, Keep Me Updated, Shipping Address
      // log it right before sending
        // before Purchase, chek redux tools, see if any is in there???
      // put this info into shared data state that EmpowerPlant.tsx uses

    // ----------- Sentry Start Transaction ------------------------
    let transaction = Sentry.startTransaction({name: 'checkout'});
    Sentry.configureScope((scope) => scope.setSpan(transaction));
    // -------------------------------------------------------------

    // TODO
    // Update in this method
    let data = await placeOrder(Toast);
    
    // ----------- Sentry Finish Transaction -----------------------
    const span = transaction.startChild({
      data,
      op: 'task',
      description: `processing shopping cart result`,
    });

    span.finish();
    transaction.finish();

    // -------------------------------------------------------------
  };
  const placeOrder = async (
    uiToast: null | UIToast = null,
  ): Promise<Response> => {
    setOrderStatusUI(true);
    const data = {cart: Object.values(cartData)};
    let response = await fetch( 
      `${BACKEND_URL}/checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          email: 'test@sentry.io',
        },
        body: JSON.stringify(data),
      },
    ).catch((err) => {
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

  return (
    <View style={styles.screen}>
      <View style={styles.flavorContainer}>
        <Image
          source={require('../assets/sentry-logo.png')}
          style={styles.logo}
        />
        <Text style={{marginLeft: 5, fontWeight: '500'}}>
          Deliver to Sentry - San Francisco 94105
        </Text>
      </View>
      <View style={styles.titleContainer}>
        <View>
          {cartItems.length == 0 ? (
            <Text>"No items in cart"</Text>
          ) : (
            <div>HOLDER</div>
            // subTotalDisplay(computeCartTotal(cartItems))
          )}
        </View>
        <GradientBtn
          buttonText={styles.buttonText}
          // colors={['#FFE0B2', '#FFB74D']}
          colors={['#002626']}
          style={styles.linearGradient}
          onPress={() => performCheckoutOnServer()}
          progressState={orderStatusUI}
          name={'Place your order'}></GradientBtn>
      </View>
      <View>
        <FlatList
          contentContainerStyle={styles.contentContainer}
          data={Object.values(cartData)}
          renderItem={({item}) => {
            return (
              <CartItem
                appDispatch={dispatch}
                quantity={item.quantity}
                // sku={item.sku}
                // name={item.name}
                title={item.title}
                // image={item.image}
                imgcropped={item.imgcropped} 
                id={item.id}
                type={item.type}
                price={item.price}
              />
            );
          }}
          keyExtractor={(item) => item.sku}
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
  // sku: string;
  // name: string;
  imgcropped: string;
  id: number;
  type: string;
  quantity: number;
  price: number;
  appDispatch: AppDispatch;
  title: string;
}): React.ReactElement => {
  const deleteItem = (sku: string) => {
    props.appDispatch({type: 'DELETE_FROM_CART', payload: sku});
  };
  console.log("> props", props)
  return (
    <View style={styles.statisticContainer}>
      <View>{selectImage(props.imgcropped)}</View>
      <View>
        <Text style={styles.itemTitle}>
          {props.title.charAt(0).toUpperCase() + props.title.slice(1)}
        </Text>
        
        {/* TODO <Text style={styles.sku}>{'sku: ' + props.sku}</Text> */}
        <Text style={styles.itemPrice}>
          {'$' + (props.price / 1000).toFixed(2) + ` (${props.quantity})`}
        </Text>
        <GradientBtn
          buttonText={styles.buttonText}
          colors={['#ebebeb', '#b3b3b3']}
          style={styles.deleteBtn}
          name={'Delete'}
          progressState={false}
          onPress={() => deleteItem(props.id.toString())}></GradientBtn>
      </View>
    </View>
  );
};

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
    color:'white'
  },
  itemTitle: {
    marginBottom: 5,
    fontSize: 17,
    fontWeight: '500',
    color:'#002626',
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#002626',
  },
});
// backgroundColor: '#002626'
// color:'#002626'