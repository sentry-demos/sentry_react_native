import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import Toast from 'react-native-toast-message';
import {AppDispatch} from '../reduxApp';
import {StyledButton} from './StyledButton';
import * as Sentry from '@sentry/react-native';

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
    <View style={styles.statisticContainer}>
      <View style={styles.card}>{selectImage(props.imgcropped)}</View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{props.title}</Text>
        <Text style={styles.itemPrice}>{'$' + props.price}</Text>
        <StyledButton title={'Add to Cart'} onPress={onAddToCartPressed} />
      </View>
    </View>
  );
};

export const ProfiledStyledProductCard = Sentry.withProfiler(StyledProductCard);

const ProfiledImage = Sentry.withProfiler(Image);

export const selectImage = (source: string): React.ReactElement => {
  /**
   * Images need to be able to be analyzed so that the packager can resolve them and package in the app automatically.
   * Dynamic strings with require syntax is not possible.
   * https://github.com/facebook/react-native/issues/2481
   */
  // Image name comes from the url path to the image. In this app, we have the images in the bundle. In application-monitoring the url path is used for fetching the image.
  let length = source.split('/').length;
  let image = source.split('/')[length - 1];
  switch (image) {
    case 'plant-spider-cropped.jpg':
      return (
        <ProfiledImage
          style={styles.tinyImage}
          source={require('../assets/images/plant-spider-cropped.png')}
        />
      );
    case 'plant-to-text-cropped.jpg':
      return (
        <ProfiledImage
          style={styles.tinyImage}
          source={require('../assets/images/plant-to-text-cropped.png')}
        />
      );
    case 'nodes-cropped.jpg':
      return (
        <ProfiledImage
          style={styles.tinyImage}
          source={require('../assets/images/nodes-cropped.png')}
        />
      );
    case 'mood-planter-cropped.png':
      return (
        <ProfiledImage
          style={styles.tinyImage}
          source={require('../assets/images/mood-planter-cropped.png')}
        />
      );
    default:
      return (
        <ProfiledImage
          style={styles.tinyImage}
          source={require('../assets/images/mood-planter-cropped.png')}
        />
      );
  }
};

const styles = StyleSheet.create({
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
});
