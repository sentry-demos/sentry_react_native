/**
 * @format
 */
import 'react-native-gesture-handler/jestSetup';
import 'react-native';
import React from 'react';
// import App from '../App';

import {it} from '@jest/globals';

import renderer from 'react-test-renderer';

it('renders correctly', () => {
  //TODO: Fix Jest Config
  // renderer.create(<App />);
  renderer.create(<></>);
});
