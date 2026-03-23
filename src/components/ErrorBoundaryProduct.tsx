import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import * as Sentry from '@sentry/react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import {StyledButton} from './StyledButton';

// Throws during render so the ErrorBoundary can catch it
const BuggyCart = (): React.ReactElement => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Error boundary triggered from error product card');
  }

  return (
    <StyledButton
      testID="add-to-cart-button-error-product"
      title="Add to cart"
      onPress={() => setShouldThrow(true)}
      style={{
        default: styles.addToCartButton,
        pressed: styles.addToCartButton,
      }}
    />
  );
};

const FallbackComponent = (): React.ReactElement => (
  <View style={styles.fallback}>
    <Icon name="circle-exclamation" size={24} color="#c0392b" />
    <Text style={styles.fallbackText}>Something went wrong</Text>
  </View>
);

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
          <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
            <BuggyCart />
          </Sentry.ErrorBoundary>
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
  fallback: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fallbackText: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '500',
  },
});
