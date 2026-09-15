import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  View,
  PressableProps,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation';
import {selectImage} from '../components/imageFromAssets';
import {Product} from '../types/Product';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyledButton} from '../components/StyledButton';
import {FontAwesome6} from '@expo/vector-icons';
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import {BACKEND_URL} from '../config';
import {android} from '../../utils/platform';

const ProductDetailScreen = ({
  navigation,
  route: {params},
}: StackScreenProps<RootStackParamList>) => {
  console.debug('Loading ProductDetailScreen...', {
    id: params?.id,
    title: params?.title,
  });

  const showProductDetail = !!params;
  const onClosePress = () => navigation.goBack();

  React.useEffect(() => {
    if (params) {
      Sentry.logger.info('Product detail viewed', {
        productId: params.id,
        productTitle: params.title,
        price: params.price,
      });
    }
  }, [params]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/success`);
  }, []);

  return (
    <SafeAreaView style={screenStyles.screen}>
      {showProductDetail ? <ProductDetail {...params} /> : <ProductNotFound />}
      <ProfiledCloseButton onPress={onClosePress} />
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fcfcf1',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});

const ProductDetail = (props: Product) => {
  const dispatch = useDispatch();

  const onPressAddToCartButton = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: props.id,
        title: props.title,
        price: props.price,
        quantity: 1,
        imgcropped: props.imgcropped,
      },
    });
    Sentry.logger.info(
      Sentry.logger.fmt`'${props.title}' added to cart from product detail`,
      {
        productId: props.id,
        productTitle: props.title,
        price: props.price,
        productType: props.type,
      },
    );
  };

  return (
    <ScrollView
      style={detailStyles.container}
      contentContainerStyle={detailStyles.contentScroll}>
      <View style={detailStyles.image}>
        {selectImage(props.imgcropped, {
          width: '105%',
          height: 400,
        })}
      </View>
      <View style={detailStyles.contentContainer}>
        <Text style={detailStyles.title}>{props.title}</Text>
        <Text style={detailStyles.description}>{props.description}</Text>
        <Text style={detailStyles.description}>{props.descriptionfull}</Text>
        <Text style={detailStyles.price}>${props.price}</Text>
        <StyledButton
          title="Add to cart"
          onPress={onPressAddToCartButton}
          isLoading={false}
          key={props.id}
          style={{
            default: detailStyles.addToCartButton,
            pressed: detailStyles.addToCartButton,
          }}
        />
      </View>
    </ScrollView>
  );
};

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentScroll: {
    flexDirection: 'column',
  },
  contentContainer: {
    margin: 10,
  },
  image: {
    marginTop: -70,
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#002626',
  },
  description: {
    marginBottom: 10,
    color: '#002626',
  },
  price: {
    fontSize: 24,
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#002626',
  },
  addToCartButton: {
    alignSelf: 'flex-end',
  },
});

const CloseButton = ({onPress}: {onPress: () => void}) => {
  const style = getCloseButtonStyles(useSafeAreaInsets().top);
  const pressableStyle: PressableProps['style'] = ({pressed}) =>
    pressed
      ? {
          ...style.container,
          backgroundColor: '#f6cfb2',
        }
      : style.container;

  return (
    <Pressable onPress={onPress} style={pressableStyle}>
      <FontAwesome6 name="xmark" size={24} color="#fff" />
    </Pressable>
  );
};

const ProfiledCloseButton = Sentry.withProfiler(CloseButton);

const getCloseButtonStyles = (top: number) =>
  StyleSheet.create({
    container: {
      width: 50,
      height: 50,
      borderRadius: 30,
      backgroundColor: '#002626',
      position: 'absolute',
      top: top + (android(10) || 0),
      left: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

const ProductNotFound = () => {
  return <Text>Product Not Found</Text>;
};

export default Sentry.withProfiler(ProductDetailScreen);
