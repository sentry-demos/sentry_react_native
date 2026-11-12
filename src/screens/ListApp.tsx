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
import * as Sentry from '@sentry/react-native';

declare const global: any;
const globalAny: any = global;

import {getTestProps} from '../../utils/getTestProps';
import {BACKEND_URL} from '../config';

const ListApp = () => {
  const [showBadCode, setShowBadCode] = React.useState(false);

  const setScopeProps = () => {
    const dateString = new Date().toString();

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

    Sentry.setAttribute('SINGLE-ATTRIBUTE', dateString);
    Sentry.setAttributes({
      'MULTI-ATTRIBUTE-STRING': dateString,
      'MULTI-ATTRIBUTE-NUMBER': 418,
      'MULTI-ATTRIBUTE-BOOLEAN': true,
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
          <Text style={styles.welcomeTitle}>Debug</Text>
          <Text style={styles.welcomeBody}>
            Each button sends data to Sentry: errors, crashes, hangs, rage taps,
            or scope data.
          </Text>
          <View style={styles.buttonArea}>
            <TouchableOpacity
              onPress={() => {
                Sentry.captureMessage('Test Message');
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Capture Message</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Sentry.captureException(new Error('Test Error'));
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Capture Exception</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                throw new Error('Thrown Error');
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Uncaught Thrown Error</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Promise.reject(new Error('Unhandled Promise Rejection'));
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Unhandled Promise Rejection</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                Sentry.nativeCrash();
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Native Crash</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              onPress={() => {
                setScopeProps();
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Set Scope Properties</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              {...getTestProps('block-js-thread-button')}
              onPress={() => {
                const end = Date.now() + 6000;
                while (Date.now() < end) {
                  // Busy wait so the JS thread cannot run anything else.
                }
              }}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Block JS Thread</Text>
              </Sentry.Unmask>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity {...getTestProps('rage-tap-button')}>
              <Sentry.Unmask>
                <Text style={styles.buttonText}>Rage Tap Me</Text>
              </Sentry.Unmask>
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
                <Sentry.Unmask>
                  <Text style={styles.buttonText}>
                    Activate Error Boundary {showBadCode && <div />}
                  </Text>
                </Sentry.Unmask>
              </TouchableOpacity>
            </Sentry.ErrorBoundary>
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
});

export default Sentry.withProfiler(ListApp);
