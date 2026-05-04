import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import EndToEndTestsScreen from '../screens/EndToEndTestsScreen';
import ListApp from '../screens/ListApp';
import ManualTrackerScreen from '../screens/ManualTrackerScreen';
import PerformanceTimingScreen from '../screens/PerformanceTimingScreen';
import ReduxScreen from '../screens/ReduxScreen';
import TrackerScreen from '../screens/TrackerScreen';
import {RootStackParamList} from '../navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DebugNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListApp" component={ListApp} />
      <Stack.Screen name="Tracker" component={TrackerScreen} />
      <Stack.Screen name="ManualTracker" component={ManualTrackerScreen} />
      <Stack.Screen
        name="PerformanceTiming"
        component={PerformanceTimingScreen}
      />
      <Stack.Screen name="Redux" component={ReduxScreen} />
      <Stack.Screen name="EndToEndTests" component={EndToEndTestsScreen} />
    </Stack.Navigator>
  );
};

export default DebugNavigator;
