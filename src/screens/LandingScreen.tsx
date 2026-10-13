import * as React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {RootStackParamList} from '../navigation';
import {StyledButton} from '../components/StyledButton';

const LandingScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, 'Landing'>) => {
  React.useEffect(() => {
    Sentry.logger.info('Landing screen viewed');
    Sentry.reportFullyDisplayed();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/mood-planter-cropped.png')}
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Sentry.Unmask>
            <Text style={styles.title}>Empower Plant</Text>
          </Sentry.Unmask>
          <StyledButton
            testID="landing-enter-button"
            title="Shop Now"
            onPress={() => {
              Sentry.logger.info('Navigating to shop from landing screen');
              navigation.navigate('Main');
            }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fcfcf1',
  },
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 64,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#002626',
  },
});
