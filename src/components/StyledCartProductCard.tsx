import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AppDispatch} from '../reduxApp';
import {StyledButton} from './StyledButton';
import * as Sentry from '@sentry/react-native';
import {selectImage} from './imageFromAssets';

export const StyledCartProductCard = (props: {
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
    <View style={styles.cardContainer}>
      {selectImage(props.imgcropped, {
        width: '100%',
        height: 200,
        marginBottom: 10,
      })}
      <Text style={styles.itemTitle}>
        {props.title.charAt(0).toUpperCase() + props.title.slice(1)}
      </Text>

      <Text style={styles.itemPrice}>
        {'$' + props.price + ` (${props.quantity})`}
      </Text>
      <StyledButton
        title={'Delete'}
        onPress={() => deleteItem(props.id.toString())}
      />
    </View>
  );
};

export const ProfiledStyledCartProductCard = Sentry.withProfiler(
  StyledCartProductCard,
);

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    padding: 12,
    borderBottomWidth: 1,

    borderColor: '#dbdbdb',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemTitle: {
    marginBottom: 10,
    fontSize: 24,
    fontWeight: '500',
    color: '#002626',
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#002626',
    marginBottom: 20,
  },
});
