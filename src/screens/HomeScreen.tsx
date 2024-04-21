import * as React from 'react';
import {Button, View, StyleSheet, Text, FlatList} from 'react-native';
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import {BACKEND_URL} from '../config';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation';
import {ProfiledStyledProductCard} from '../components/StyledProductCard';
import { Product } from '../types/Product';

type ExtendedSentryScope = Sentry.Scope & {
  _tags: Record<string, string>;
  _user: Record<string, string>;
};

/**
 * An example of how to add a Sentry Transaction to a React component manually.
 * So you can control all spans that belong to that one transaction.
 * EmpowerPlant is a  Higher-order component, because it's a Function Component,
 * and both Function Components and Class Components are Higher-order components.
 * Higher-order component can only read the props coming in. Props are changed as they're passed in.
 * Redux not in use here, so redux is not passing props, therefore Profile can't view that.
 * Could do redux w/ hooks, but the Profiler isn't going to work with that yet.
 */
const EmpowerPlant = ({navigation}: StackScreenProps<RootStackParamList>) => {
  const dispatch = useDispatch();
  const [toolData, setProductData] = React.useState<Product[] | [] | null>(
    null,
  );

  const loadData = () => {
    setProductData(null);
    let se, customerType, email;
    Sentry.withScope(function (scope: Sentry.Scope) {
      const extendedScope = scope as ExtendedSentryScope;
      [se, customerType] = [
        extendedScope._tags.se,
        extendedScope._tags.customerType,
      ];
      email = extendedScope._user.email;
    });

    const headers: Record<string, string> = {
      se: se ?? '',
      customerType: customerType ?? '',
      email: email ?? '',
      'Content-Type': 'application/json',
    };
    fetch(`${BACKEND_URL}/products`, {
      method: 'GET',
      headers,
    })
      .then((response) => response.json())
      .then((json) => {
        setProductData(json);
      })
      .catch((err) => console.log('> api Erorr: ', err));
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRightContainerStyle: {paddingRight: 20},
      headerLeftContainerStyle: {paddingLeft: 20},
      headerRight: () => {
        return (
          <Button
            onPress={() => {
              navigation.navigate('Cart');
            }}
            title="Cart"
          />
        );
      },
      headerLeft: () => {
        return (
          <Button
            onPress={() => {
              navigation.navigate('ListApp');
            }}
            title="List App"
          />
        );
      },
    });
  }, [navigation]);

  React.useEffect(() => {
    loadData(); // this line is not blocking
  }, []);

  const onProductsListRefresh = () => {
    loadData();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Empower Plant</Text>
      </View>
      <View style={styles.screen}>
        <FlatList
          id={'productList'}
          onRefresh={onProductsListRefresh}
          refreshing={toolData === null}
          data={toolData}
          renderItem={({item}) => {
            return (
              <ProfiledStyledProductCard
                appDispatch={dispatch}
                id={item.id}
                imgcropped={item.imgcropped}
                price={item.price}
                title={item.title}
                type={''}
              />
            );
          }}
          keyExtractor={(item) => `${item.id}`}
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
export default EmpowerPlant;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingRight: 5,
    paddingLeft: 5,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  sku: {
    fontSize: 16,
    color: '#002626',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002626',
  },
});
