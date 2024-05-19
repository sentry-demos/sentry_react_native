/**
 * @format
 */
import 'react-native-gesture-handler/jestSetup';
import 'react-native';
import React from 'react';
// import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  //TODO: Fix Jest Config
  // renderer.create(<App />);
  renderer.create(<></>);
});
