import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CommonActions} from '@react-navigation/native';

import * as Sentry from '@sentry/react-native';

const globalAny: any = global;

import {getTestProps} from '../../utils/getTestProps';
import {DSN, BACKEND_URL} from '../config';

interface Props {
  navigation: StackNavigationProp<any, 'ListApp'>;
}

const ListApp = (props: Props) => {
  const currentDSN = Sentry.getClient()?.getOptions().dsn;

  // Show bad code inside error boundary to trigger it.
  const [showBadCode, setShowBadCode] = React.useState(false);

  const setScopeProps = () => {
    const dateString = new Date().toString();

    // user info was already set in App.tsx
    Sentry.setUser({
      id: 'test-id-0',
      email: 'testing@testing.test',
      username: 'USER-TEST',
      specialField: 'special user field',
      specialFieldNumber: 418,
    });

    Sentry.setTag('SINGLE-TAG', dateString);
    // @ts-ignore
    Sentry.setTag('SINGLE-TAG-NUMBER', 100);
    Sentry.setTags({
      'MULTI-TAG-0': dateString,
      'MULTI-TAG-1': dateString,
      'MULTI-TAG-2': dateString,
    });

    Sentry.setExtra('SINGLE-EXTRA', dateString);
    Sentry.setExtra('SINGLE-EXTRA-NUMBER', 100);
    Sentry.setExtra('SINGLE-EXTRA-OBJECT', {
      message: 'I am a teapot',
      status: 418,
      array: ['boo', 100, 400, {objectInsideArray: 'foobar'}],
    });
    Sentry.setExtras({
      'MULTI-EXTRA-0': dateString,
      'MULTI-EXTRA-1': dateString,
      'MULTI-EXTRA-2': dateString,
    });

    Sentry.setContext('TEST-CONTEXT', {
      stringTest: 'Hello',
      numberTest: 404,
      objectTest: {
        foo: 'bar',
      },
      arrayTest: ['foo', 'bar', 400],
      nullTest: null,
      undefinedTest: undefined,
    });

    Sentry.addBreadcrumb({
      level: 'info',
      message: `TEST-BREADCRUMB-INFO: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'debug',
      message: `TEST-BREADCRUMB-DEBUG: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'error',
      message: `TEST-BREADCRUMB-ERROR: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'fatal',
      message: `TEST-BREADCRUMB-FATAL: ${dateString}`,
    });
    Sentry.addBreadcrumb({
      level: 'info',
      message: `TEST-BREADCRUMB-DATA: ${dateString}`,
      data: {
        stringTest: 'Hello',
        numberTest: 404,
        objectTest: {
          foo: 'bar',
        },
        arrayTest: ['foo', 'bar', 400],
        nullTest: null,
        undefinedTest: undefined,
      },
      category: 'TEST-CATEGORY',
    });

    console.log('Test scope properties were set.');
  };

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/success`);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        {globalAny.HermesInternal == null ? null : (
          <View style={styles.engine}>
            <Text>Engine: Hermes</Text>
            {(() => {
              Sentry.setTag('Hermes', 'enabled');
              return null;
            })()}
          </View>
        )}
        <View style={styles.body}>
          <Image
            source={require('../assets/sentry-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.welcomeTitle}>Hey there!</Text>
          <Text style={styles.welcomeBody}>
            This is a simple sample app for you to try out the Sentry React
            Native SDK.
          </Text>
          <TouchableOpacity
            {...getTestProps('openEndToEndTests')}
            onPress={() => {
              props.navigation.navigate('EndToEndTests');
            }}>
            <Text style={styles.hiddenE2e}>End to End Tests</Text>
          </TouchableOpacity>
          {currentDSN == null && DSN && (
            <View style={styles.warningBlock}>
              <Text style={styles.warningText}>
                😃 Hey! You need to replace the DSN inside Sentry.init with your
                own or you won't see the events on your dashboard.
              </Text>
            </View>
          )}
          <View style={styles.buttonArea}>
            <TouchableOpacity
              onPress={() => {
                Sentry.captureMessage('Test Message');
              }}>
              <Text style={styles.buttonText}>Capture Message</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Sentry.captureException(new Error('Test Error'));
              }}>
              <Text style={styles.buttonText}>Capture Exception</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                throw new Error('Thrown Error');
              }}>
              <Text style={styles.buttonText}>Uncaught Thrown Error</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Promise.reject(new Error('Unhandled Promise Rejection'));
              }}>
              <Text style={styles.buttonText}>Unhandled Promise Rejection</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Sentry.nativeCrash();
              }}>
              <Text style={styles.buttonText}>Native Crash</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                setScopeProps();
              }}>
              <Text style={styles.buttonText}>Set Scope Properties</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <Sentry.ErrorBoundary
              fallback={({eventId}) => (
                <Text>Error boundary caught with event id: {eventId}</Text>
              )}>
              <TouchableOpacity
                onPress={() => {
                  setShowBadCode(true);
                }}>
                <Text style={styles.buttonText}>
                  Activate Error Boundary {showBadCode && <div />}
                </Text>
              </TouchableOpacity>
            </Sentry.ErrorBoundary>
          </View>
          <View style={styles.buttonArea}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('Tracker');
              }}>
              <Text style={styles.buttonText}>Auto Tracing Example</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('ManualTracker');
              }}>
              <Text style={styles.buttonText}>Manual Tracing Example</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                // Navigate with a reset action just to test
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [
                      {name: 'Home'},
                      {
                        name: 'PerformanceTiming',
                        params: {someParam: 'hello'},
                      },
                    ],
                  }),
                );
              }}>
              <Text style={styles.buttonText}>Performance Timing</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('Redux');
              }}>
              <Text style={styles.buttonText}>Redux Example</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  logo: {
    width: 80,
    height: 80,
  },
  body: {
    backgroundColor: '#fff',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#362D59',
  },
  welcomeBody: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#362D59',
  },
  warningBlock: {
    marginTop: 12,
    backgroundColor: '#E1567C',
    padding: 8,
    borderRadius: 6,
  },
  warningText: {
    color: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  buttonArea: {
    marginTop: 20,
    backgroundColor: '#F6F6F8',
    borderWidth: 1,
    borderColor: '#c6becf',
    borderRadius: 6,
  },
  buttonText: {
    color: '#3b6ecc',
    fontWeight: '700',
    fontSize: 16,
    padding: 14,
    textAlign: 'center',
  },
  spacer: {
    height: 1,
    width: '100%',
    backgroundColor: '#c6becf',
  },
  hiddenE2e: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default Sentry.withProfiler(ListApp);
