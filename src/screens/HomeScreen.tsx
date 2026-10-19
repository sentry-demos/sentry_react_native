import * as React from 'react';
import {View, StyleSheet, Text, FlatList, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import {BACKEND_URL} from '../config';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation';
import {ProfiledStyledProductCard} from '../components/StyledProductCard';
import {Product} from '../types/Product';

type ExtendedSentryScope = Sentry.Scope & {
  _tags: Record<string, string>;
  _user: Record<string, string>;
};

const EmpowerPlant = ({navigation}: StackScreenProps<RootStackParamList>) => {
  const dispatch = useDispatch();
  const [toolData, setProductData] = React.useState<Product[] | [] | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadData = (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setProductData(null);
    }
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
    Sentry.logger.debug('Loading products', {
      endpoint: `${BACKEND_URL}/products`,
    });

    // Explicit span so the /products request always has an app-side parent (the
    // navigation transaction when one is active) and its sentry-trace is
    // propagated to Flask. Without it the fetch can fire with no active span and
    // the backend ends up in a separate, rootless trace.
    Sentry.startSpan({name: 'Load Products'}, async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/products`, {
          method: 'GET',
          headers,
        });
        const json = await response.json();
        setProductData(json);
        setIsRefreshing(false);
        Sentry.logger.info('Products loaded', {
          productCount: json.length,
        });
      } catch (err) {
        setIsRefreshing(false);
        Sentry.logger.error('Failed to load products', {
          error: err.message,
          endpoint: `${BACKEND_URL}/products`,
        });
        console.log('> api Error: ', err);
      }
    });
  };

  React.useEffect(() => {
    Sentry.logger.info('Home screen viewed');
    loadData();
  }, []);

  const onProductsListRefresh = () => {
    loadData(true);
  };

  if (toolData && toolData.length <= 10) {
    setTimeout(() => {
      console.warn('Loaded less then 10 products!');
    });
  }

  const recordFullDisplay = !!toolData;

  const onProductCardPress = (item: Product) => {
    Sentry.logger.info('Product card pressed', {
      productId: item.id,
      productTitle: item.title,
    });
    navigation.navigate('ProductDetail', item);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Empower Plant</Text>
      </View>
      <View style={styles.listContainer}>
        <Sentry.TimeToFullDisplay record={recordFullDisplay} />
        {toolData === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#002626" />
          </View>
        ) : (
          <FlatList
            id={'productList'}
            onRefresh={onProductsListRefresh}
            refreshing={isRefreshing}
            data={toolData}
            contentContainerStyle={styles.productListContainer}
            renderItem={({item}) => {
              return (
                <ProfiledStyledProductCard
                  appDispatch={dispatch}
                  id={item.id}
                  imgcropped={item.imgcropped}
                  price={item.price}
                  title={item.title}
                  description={item.description}
                  type={''}
                  onPress={() => onProductCardPress(item)}
                />
              );
            }}
            keyExtractor={(item) => `${item.id}`}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default EmpowerPlant;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fcfcf1',
  },
  titleContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sku: {
    fontSize: 16,
    color: '#002626',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#002626',
  },
  productListContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 100,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
