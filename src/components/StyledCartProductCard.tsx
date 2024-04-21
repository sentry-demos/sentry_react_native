import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AppDispatch} from '../reduxApp';
import {StyledButton} from './StyledButton';
import {selectImage} from './StyledProductCard';
import * as Sentry from '@sentry/react-native';

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
    <View style={styles.statisticContainer}>
      <View>{selectImage(props.imgcropped)}</View>
      <View>
        <Text style={styles.itemTitle}>
          {props.title.charAt(0).toUpperCase() + props.title.slice(1)}
        </Text>

        {/* TODO <Text style={styles.sku}>{'sku: ' + props.sku}</Text> */}
        <Text style={styles.itemPrice}>
          {'$' + props.price + ` (${props.quantity})`}
        </Text>
        <StyledButton
          title={'Delete'}
          onPress={() => deleteItem(props.id.toString())}
        />
      </View>
    </View>
  );
};

export const ProfiledStyledCartProductCard = Sentry.withProfiler(
  StyledCartProductCard,
);

const styles = StyleSheet.create({
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
});
