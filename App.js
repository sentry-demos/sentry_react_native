/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import React, { Component } from 'react';
import { Button, Platform, StyleSheet, Text, View, TextInput, ImageBackground, Image, SafeAreaView } from 'react-native';

import * as Sentry from '@sentry/react-native';

const Separator = () => (
  <View style={styles.separator} />
);

Sentry.init({
  dsn: "https://35740e2bbfd341d9b60ccf0e23c21d52@o87286.ingest.sentry.io/5433022",
  logLevel: "debug",
  debug: true,
  deactivateStacktraceMerging: false,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
});


export default class App extends React.Component {
  render() {
    return (
      <ImageBackground source={require('./assets/sentry-pattern.png')} style={{ width: '100%', height: '100%' }}>
        <View style={styles.container}>
          <Image source={require('./assets/sentry-glyph-black.png')} style={{ height: 70, width: 70, alignSelf: "center" }}></Image>
          <Text style={styles.welcome}>Sample React-Native app</Text>

          <TextInput
            style={styles.emailTextInput}
            onChangeText={(email) => Sentry.setUser({ email })}
            accessibilityLabel={'email'}
            textContentType='emailAddress'
            placeholder='Enter email address'
            placeholderTextColor="#808080"
            textAlign='center'
            Align='center'
          />
          <View style={styles.separator} />
          <View>
            <Button
              style={styles.button}
              styleDisabled={{ color: 'red' }}
              onPress={() => { var a = undefinedVariable; }}
              accessibilityLabel={'ReferenceError: undefinedVariable is not defined'}
              title="ReferenceError: undefinedVariable is not defined"
            />
          </View>
          <View style={styles.separator} />
          <Button
            style={styles.button}
            styleDisabled={{ color: 'red' }}
            onPress={() => { var obj = {}; obj.invalidFunction(); }}
            accessibilityLabel={'TypeError: obj.invalidFunction is not a function'}
            title="TypeError: obj.invalidFunction is not a function"
          />
          <View style={styles.separator} />
          <Button
            style={styles.button}
            styleDisabled={{ color: 'red' }}
            onPress={() => { Sentry.nativeCrash(); }}
            accessibilityLabel={'native crash'}
            title="native crash!"
          />
          <Separator />
          <Button
            style={styles.button}
            styleDisabled={{ color: 'red' }}
            onPress={() => { Sentry.captureMessage('TEST message', { level: SentrySeverity.Warning }); }}
            accessibilityLabel={'send message'}
            title="send message"
          />
          <Separator />

          <Button
            style={styles.button}
            styleDisabled={{ color: 'red' }}
            onPress={() => { Sentry.setTag('customerType', 'enterprise'); Sentry.setTag('environment', 'production'); }}
            accessibilityLabel={'set sample tags'}
            title="set sample tags"
          />

        </View>
      </ImageBackground>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  button: {
    fontSize: 12,
    color: 'green'
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emailTextInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    textAlign: 'center',
    margin: 10
  }
});
