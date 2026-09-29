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

const promoErrorBody = JSON.stringify({
  error: {
    code: 'expired',
    message: 'Provided coupon code has expired.',
  },
});

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state: RootState) => state.cart);
  const contactInfoData = useSelector((state: RootState) => state.contactInfo);
  const [orderStatusUI, setOrderStatusUI] = React.useState(false);
  const [promoLoading, setPromoLoading] = React.useState(false);
  const [promoError, setPromoError] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState(false);

  const scopeData = Sentry.getCurrentScope().getScopeData();
  const se = scopeData.tags['se'];
  const customerType = scopeData.tags['customerType'];
  const email = scopeData.user?.email;

  const performCheckoutOnServer = async () => {
    const cartItems = Object.values(cartData);
    const itemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const orderTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    Sentry.metrics.count('checkout_submit.click', 1);
    Sentry.metrics.gauge('checkout_submit.num_items', itemsInCart);
    Sentry.metrics.gauge('checkout_submit.order_total', orderTotal);

    Sentry.logger.info(`Calculated itemsInCart: ${itemsInCart}`);
    Sentry.logger.info('Checkout initiated', {
      itemCount: cartItems.length,
      totalItems: itemsInCart,
    });

    await Sentry.startSpan(
      {name: 'Submit Checkout Form', forceTransaction: true},
      async (span) => {
        const activeSpan = span ?? Sentry.getActiveSpan();
        const spanContext = (activeSpan?.spanContext?.() || {}) as {traceId?: string; spanId?: string};
        Sentry.logger.info('Checkout span', {
          _traceId: spanContext.traceId,
          _spanId: spanContext.spanId,
          _startTime: Date.now() / 1000,
          _attributes: {
            cartItemCount: cartItems.length,
            totalItems: itemsInCart,
          },
        });

        Sentry.logger.info('Checkout called with cart', {
          items: cartItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
          })),
        });

        let data = await placeOrder(Toast);

        Sentry.startSpan(
          {name: 'Processing shopping cart result', op: 'task'},
          () => {
            console.log('Processing shopping cart result...', data);
            Sentry.logger.debug('Processing shopping cart result', {
              responseStatus: data?.status,
            });
          },
        );
      },
    );
  };

  const placeOrder = async (
    uiToast: null | UIToast = null,
  ): Promise<Response> => {
    setOrderStatusUI(true);
    setCheckoutError(false);

    const cart = Object.values(cartData);
    let quantities: Record<number, number> = {};
    cart.map((item) => {
      if (!quantities[item.id]) {
        quantities[item.id] = item.quantity;
      }
    });

    const totalQuantity = Object.values(quantities).reduce(
      (sum: number, qty: number) => sum + qty,
      0,
    );
    Sentry.logger.info(`Adding quantity: ${totalQuantity}`);

    const data = {
      cart: {items: cart, quantities},
      form: contactInfoData,
    };

    Sentry.logger.debug('Sending checkout request', {
      itemCount: cart.length,
      endpoint: `${BACKEND_URL}/checkout`,
      cart: JSON.stringify(data.cart),
    });

    let response = await fetch(`${BACKEND_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        email: email ?? '',
        se: String(se ?? ''),
        customerType: String(customerType ?? ''),
      },
      body: JSON.stringify(data),
    }).catch((err) => {
      Sentry.logger.error('Checkout request failed', {
        error: err.message,
        endpoint: `${BACKEND_URL}/checkout`,
      });
      setOrderStatusUI(false);
      setCheckoutError(true);
      throw new Error(err);
    });
    setOrderStatusUI(false);
    if (response.status !== 200) {
      setCheckoutError(true);
      uiToast
        ? uiToast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Error: Could not place order.',
          })
        : null;

      const errorMessage = `${response.status} - ${
        response.statusText || 'INTERNAL SERVER ERROR'
      }`;
      Sentry.logger.error(`Error: ${errorMessage}`, {
        status: response.status,
        statusText: response.statusText || 'INTERNAL SERVER ERROR',
        itemCount: cart.length,
      });

      Sentry.captureException(new Error(errorMessage));
    } else {
      Sentry.logger.info('Checkout completed successfully', {
        status: response.status,
        itemCount: cart.length,
        totalValue: cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
      });

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
        <Sentry.Unmask>
          <Text style={styles.promoCodeText}>Promo Code</Text>
        </Sentry.Unmask>
        <SafeAreaView>
          <TextInput
            style={styles.input}
            value={contactInfoData.promoCode || ''}
            placeholder="promo code"
            onPressIn={() => {
              dispatch({
                type: 'FILL_FIELDS',
                payload: 'dummydata',
                onScope: email ? email : null,
              });
            }}
          />
        </SafeAreaView>
        <View>
          {promoError && (
            <Sentry.Unmask>
              <Text style={styles.promoErrorText}>
                Unknown error applying promo code
              </Text>
            </Sentry.Unmask>
          )}

          <StyledButton
            onPress={async () => {
              setPromoLoading(true);
              setPromoError(false);

              Sentry.logger.info(
                `Applying promo code: ${contactInfoData.promoCode}`,
                {
                  promoCode: contactInfoData.promoCode,
                  action: 'promo_apply',
                },
              );

              await new Promise((resolve) => setTimeout(resolve, 750));

              setPromoLoading(false);

              Sentry.logger.error(
                `Failed to apply promo code ${contactInfoData.promoCode}: HTTP 410 | Error: 'expired'`,
                {
                  promo_code: contactInfoData.promoCode,
                  http_status: 410,
                  error_code: 'expired',
                  error_message: 'Provided coupon code has expired.',
                  response_body: promoErrorBody,
                },
              );

              setPromoError(true);
            }}
            isLoading={promoLoading}
            title={'Apply'}
          />
        </View>
        <View style={styles.placeOrderButton}>
          {checkoutError && (
            <Sentry.Unmask>
              <Text style={styles.promoErrorText}>
                Unknown error placing order
              </Text>
            </Sentry.Unmask>
          )}
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
    fetch(`${BACKEND_URL}/success`);
  }, []);

  return (
    <View style={styles.screen}>
      <Sentry.TimeToInitialDisplay record={true} />
      <Sentry.TimeToFullDisplay record={true} />
      <View style={styles.cartListWrapper}>
        <FlatList
          data={items}
          ListHeaderComponent={
            <Text style={styles.contactInfoText}>Contact Info</Text>
          }
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
          keyExtractor={(item) => String(item.id)}
        />
      </View>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  input: {
    margin: 10,
    borderWidth: 1,
    padding: 10,
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
    flexDirection: 'column',
    alignItems: 'stretch',
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
  promoCodeText: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  promoErrorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginLeft: 10,
    marginTop: 4,
  },
  placeOrderButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  cartListWrapper: {
    flex: 1,
  },
});
