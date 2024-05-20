import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import {RootState} from '../reduxApp';
import {BACKEND_URL} from '../config';
import {StyledButton} from '../components/StyledButton';

export type UIToast = typeof Toast;

const items = [
  {id: 1, placeholder: 'email', key: 'email'},
  {id: 2, placeholder: 'first name', key: 'firstName'},
  {id: 3, placeholder: 'last name', key: 'lastName'},
  {id: 4, placeholder: 'address', key: 'address'},
  {id: 5, placeholder: 'city', key: 'city'},
  {id: 6, placeholder: 'country/region', key: 'countryRegion'},
  {id: 7, placeholder: 'state', key: 'state'},
  {id: 8, placeholder: 'zip code', key: 'zipCode'},
];

/**
 * An example of how to add a Sentry Transaction to a React component manually.
 * So you can control all spans that belong to that one transaction.
 * EmpowerPlant is a  Higher-order component, because it's a Function Component,
 * and both Function Components and Class Components are Higher-order components.
 * Higher-order component can only read the props coming in. Props are changed as they're passed in.
 * Redux not in use here, so redux is not passing props, therefore Profile can't view that.
 * Could do redux w/ hooks, but the Profiler isn't going to work with that yet.
 */
const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state: RootState) => state.cart);
  const contactInfoData = useSelector((state: RootState) => state.contactInfo);
  const [orderStatusUI, setOrderStatusUI] = React.useState(false);

  let se, customerType, email;
  Sentry.withScope(function (scope) {
    [se, customerType] = [scope._tags.se, scope._tags.customerType];
    email = scope._user.email;
  });
  const performCheckoutOnServer = async () => {
    // ----------- Sentry Start Transaction ------------------------
    let transaction = Sentry.startTransaction({name: 'Submit Checkout Form'});
    Sentry.configureScope((scope) => scope.setSpan(transaction));

    let data = await placeOrder(Toast);

    // ----------- Sentry Finish Transaction -----------------------
    const span = transaction.startChild({
      data,
      op: 'task',
      description: 'processing shopping cart result',
    });
    span.finish();
    transaction.finish();
  };

  const placeOrder = async (
    uiToast: null | UIToast = null,
  ): Promise<Response> => {
    setOrderStatusUI(true);

    const cart = Object.values(cartData);
    let quantities = {};
    cart.map((item) => {
      if (!quantities[item.id]) {
        quantities[item.id] = item.quantity;
      }
    });

    const data = {
      // This is the data structure implemented by application-monitoring-react and flask
      cart: {items: cart, quantities},
      form: contactInfoData,
    };

    let response = await fetch(`${BACKEND_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        email,
        se,
        customerType,
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
  const renderFooter = () => {
    return (
      <View>
        <View style={styles.flavorContainer}>
          {/* <Image
                    source={require('../assets/sentry-logo.png')}
                    style={styles.logo}
                    /> */}
          <Text style={styles.deliverToText}>
            Deliver to Sentry - San Francisco {contactInfoData.zipCode}
          </Text>
        </View>
        <View>
          <StyledButton
            onPress={() => performCheckoutOnServer()}
            isLoading={orderStatusUI}
            title={'Place your order'}
          />
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/success`); // exists just to add span data to demo
  }, []);

  return (
    <View style={styles.screen}>
      <Sentry.TimeToInitialDisplay record={true} />
      <Sentry.TimeToFullDisplay record={true} />
      <Text style={styles.contactInfoText}>Contact Info</Text>
      <View style={styles.cartListWrapper}>
        <FlatList
          data={items}
          appDispatch={dispatch}
          ListFooterComponent={renderFooter}
          ListFooterComponentStyle={styles.flavorContainer}
          renderItem={({item}) => {
            return (
              <SafeAreaView>
                <TextInput
                  style={styles.input}
                  value={contactInfoData[item.key] || ''}
                  placeholder={item.placeholder}
                  onPressIn={() => {
                    dispatch({
                      type: 'FILL_FIELDS',
                      payload: 'dummydata',
                      onScope: email ? email : null,
                    });
                  }}
                />
              </SafeAreaView>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

/* This works because sentry/react-native wraps sentry/react right now.
 * The Sentry Profiler can use any higher-order component but you need redux if you want the `react.update`,
 * because that comes from props being passed into the Profiler (which comes from redux).
 * The Profiler doesn't watch the internal state of EmpowerPlant here, and that's why `useState` won't be picked up by sentry sdk, unless you use the Profiler.
 * Don't use the Sentry Profiler here yet, because the profiler span was finishing so quick that the transaction would finish prematurely,
 * and this was causing Status:Cancelled on that span, and warning "cancelled span due to idleTransaction finishing"
 */
export default CheckoutScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  input: {
    height: 40,
    margin: 10,
    borderWidth: 1,
    padding: 10,

    // new
    borderRadius: 2,
    borderColor: '#002626',
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

    width: 300,
    margin: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  flavorContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deliverToText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  contactInfoText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 32,
    fontWeight: '600',
    marginLeft: 10,
  },
  cartListWrapper: {
    flex: 1,
  },
});
