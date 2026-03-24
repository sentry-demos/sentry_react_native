import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import {StyledButton} from './StyledButton';

const BuggyCart = (): React.ReactElement => {
  return (
    <StyledButton
      testID="add-to-cart-button-error-product"
      title="Add to cart"
      onPress={() => {
        throw new Error('Error boundary triggered from error product card');
      }}
      style={{
        default: styles.addToCartButton,
        pressed: styles.addToCartButton,
      }}
    />
  );
};

export const ErrorBoundaryProduct = (): React.ReactElement => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHero}>
        <Icon name="triangle-exclamation" size={48} color="#e74c3c" />
      </View>
      <View style={styles.cardDetail}>
        <View style={styles.cardDetailContent}>
          <Text style={styles.cardTitle}>Error Product</Text>
          <Text style={styles.cardDescription}>Boundary error testing</Text>
        </View>
        <View style={styles.cardDetailAction}>
          <BuggyCart />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  cardHero: {
    width: '40%',
    height: '100%',
    backgroundColor: '#fdf0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetail: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
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
  cardTitle: {
    marginBottom: 5,
    fontSize: 24,
    fontWeight: '500',
    color: '#c0392b',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
  addToCartButton: {
    margin: 10,
  },
});
