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
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import {AppDispatch} from '../reduxApp';
import {GradientBtn} from './CartScreen';
import {BACKEND_URL} from '../config';

/**
 * An example of how to add a Sentry Transaction to a React component manually.
 * So you can control all spans that belong to that one transaction.
 * ToolStore is a  Higher-order component, becuase it's a Function Component,
 * and both Function Components and Class Components are Higher-order components.
 * Higher-order component can only read the props coming in. Props are changed as they're passed in.
 * Redux not in use here, so redux is not passing props, therefore Profile can't view that.
 * Could do redux w/ hooks, but the Profiler isn't going to work with that yet.
 */
const ToolStore = ({navigation}) => {
  const dispatch = useDispatch();
  const [toolData, setToolData] = React.useState<
    | {
        sku: string;
        name: string;
        image: string;
        id: number;
        type: string;
        price: number;
      }[]
    | null
  >(null);

  const loadData = () => {
    setToolData(null);

    fetch(`${BACKEND_URL}/tools`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setToolData(json);
      });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRightContainerStyle: {paddingRight: 20},
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
    });
  }, [navigation]);

  React.useEffect(() => {
    loadData(); // this line is not blocking
  }, []); 

  return (
    <View style={styles.screen}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Results</Text>
      </View>
      <View style={styles.screen}>
        {toolData ? (
          <FlatList
            data={toolData}
            renderItem={({item}) => {
              return (
                <ToolItem
                  appDispatch={dispatch}
                  sku={item.sku}
                  name={item.name}
                  image={item.image}
                  id={item.id}
                  type={item.type}
                  price={item.price}
                />
              );
            }}
            keyExtractor={(item) => item.sku}
          />
        ) : (
          <ActivityIndicator size="small" color="#404091" />
        )}
      </View>
    </View>
  );
};

/* This works because sentry/react-native wraps sentry/react right now.
* The Sentry Profiler can use any higher-order component but you need redux if you want the `react.update`, 
* because that comes from props being passed into the Profiler (which comes from redux).
* The Profiler doesn't watch the internal state of ToolStore here, and that's why `useState` won't be picked up by sentry sdk, unless you use the Profiler.
* Don't use the Sentry Profiler here yet, because the profiler span was finishing so quick that the transaction would finish prematurely,
* and this was causing Status:Cancelled on that span, and warning "cancelled span due to idleTransaction finishing"
*/
export default ToolStore

export const selectImage = (source: string): React.ReactElement => {
  /**
   * Images need to be able to be analyzed so that the packager can resolve them and package in the app automatically.
   * Dynamic strings with require syntax is not possible.
   * https://github.com/facebook/react-native/issues/2481
   */
  switch (source) {
    case 'wrench.png':
      return (
        <Image
          style={styles.tinyImage}
          source={require('../assets/images/wrench.png')}
        />
      );
    case 'nails.png':
      return (
        <Image
          style={styles.tinyImage}
          source={require('../assets/images/nails.png')}
        />
      );
    case 'screwdriver.png':
      return (
        <Image
          style={styles.tinyImage}
          source={require('../assets/images/screwdriver.png')}
        />
      );
    case 'hammer.png':
      return (
        <Image
          style={styles.tinyImage}
          source={require('../assets/images/hammer.png')}
        />
      );
    default:
      return (
        <Image
          style={styles.tinyImage}
          source={require('../assets/images/hammer.png')}
        />
      );
  }
};

/* You could wrap this with the Sentry Profiler, 
* but then you'd have hundreds/thousands of spans because the tools response is not paginated.
*/
const ToolItem = (props: {
  sku: string;
  name: string;
  image: string;
  id: number;
  type: string;
  price: number;
  appDispatch: AppDispatch;
}): React.ReactElement => {
  return (
    <View style={styles.statisticContainer}>
      <View style={styles.card}>{selectImage(props.image)}</View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>
          {props.name.charAt(0).toUpperCase() + props.name.slice(1)}
        </Text>
        <Text style={styles.itemPrice}>
          {'$' + (props.price / 1000).toFixed(2)}
        </Text>
        <Text style={styles.sku}>{'sku: ' + props.sku}</Text>
        <GradientBtn
          progressState={false}
          style={styles.linearGradient}
          buttonText={styles.buttonText}
          name={'Add to Cart'}
          colors={['#FFE0B2', '#FFB74D']}
          onPress={() => {
            props.appDispatch({
              type: 'ADD_TO_CART',
              payload: {
                image: props.image,
                sku: props.sku,
                id: props.id,
                name: props.name,
                price: props.price,
                quantity: 1,
                type: props.type,
              },
            });
            Toast.show({
              type: 'success',
              position: 'bottom',
              text1: 'Added to Cart',
              visibilityTime: 0.5,
            });
          }}></GradientBtn>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemTitle: {
    marginBottom: 5,
    fontSize: 17,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#371d40',
  },
  sku: {
    fontSize: 16,
    color: '#919191',
    marginBottom: 10,
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
    width: '40%',
    height: '100%',

    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
    height: '100%',
    paddingLeft: 10,
    paddingTop: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  statisticContainer: {
    width: '100%',
    height: 200,

    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statisticTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  statisticCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  flavorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
  },
  linearGradient: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8D6E63',
  },

  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 5,
    color: '#000000',
    backgroundColor: 'transparent',
  },
});
