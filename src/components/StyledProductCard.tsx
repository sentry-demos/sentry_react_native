import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import {AppDispatch} from '../reduxApp';
import {StyledButton} from './StyledButton';
import * as Sentry from '@sentry/react-native';
import {selectImage} from './imageFromAssets';

export const StyledProductCard = (props: {
  id: number;
  type: string;
  price: number;
  title: string;
  imgcropped: string;
  appDispatch: AppDispatch;
}): React.ReactElement => {
  const onAddToCartPressed = () => {
    props.appDispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: props.id,
        title: props.title,
        price: props.price,
        quantity: 1,
        imgcropped: props.imgcropped,
      },
    });
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Added to Cart',
      visibilityTime: 0.5,
    });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHero}>{selectImage(props.imgcropped)}</View>
      <View style={styles.cardDetail}>
        <View style={styles.cardDetailContent}>
          <Text style={styles.cardTitle}>{props.title}</Text>
          <Text style={styles.itemPrice}>${props.price}</Text>
        </View>
        <View style={styles.cardDetailAction}>
          <StyledButton
            title="Add to cart"
            onPress={onAddToCartPressed}
            style={{
              default: styles.addToCartButtonDefault,
              pressed: styles.addToCartButtonDefault,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export const ProfiledStyledProductCard = Sentry.withProfiler(StyledProductCard);

const styles = StyleSheet.create({
  cardTitle: {
    marginBottom: 5,
    fontSize: 24,
    fontWeight: '500',
    color: '#002626',
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#002626',
  },
  cardHero: {
    width: '40%',
    height: '100%',

    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetail: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignContent: 'space-between',
  },
  cardDetailContent: {
    padding: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  cardDetailAction: {
    flex: 0,
  },
  cardContainer: {
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
  addToCartButtonDefault: {
    margin: 10,
  },
});
