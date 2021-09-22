import * as React from 'react';
import {
  Image,
  Button,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TextInput
} from 'react-native';
import {useDispatch} from 'react-redux';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';
import {AppDispatch} from '../reduxApp';
import {GradientBtn} from './CartScreen';
import {BACKEND_URL} from '../config';

/** TODO
 * An example of how to add a Sentry Transaction to a React component manually.
 * So you can control all spans that belong to that one transaction.
 * EmpowerPlant is a  Higher-order component, becuase it's a Function Component,
 * and both Function Components and Class Components are Higher-order components.
 * Higher-order component can only read the props coming in. Props are changed as they're passed in.
 * Redux not in use here, so redux is not passing props, therefore Profile can't view that.
 * Could do redux w/ hooks, but the Profiler isn't going to work with that yet.
 */
const ContactInfoScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [toolData, setToolData] = React.useState<
    | {
        sku: string;
        name: string;
        // description:string
        image: string;
        // img: string;
        id: number;
        type: string;
        price: number;
      }[]
    | null
  >(null);

//   const loadData = () => {};

//   React.useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRightContainerStyle: {paddingRight: 20},
//       headerRight: () => {
//         return (
//           <Button
//             onPress={() => {
//               navigation.navigate('Cart');
//             }}
//             title="Cart"
//           />
//         );
//       },
//     });
//   }, [navigation]);

//   React.useEffect(() => {
//     loadData(); // this line is not blocking
//   }, []); 
      const items = [{id:1},{id:2}]
  return (
    <View style={styles.screen}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Empower Plant</Text>
      </View>
      <View>
          <FlatList
            data={items}
            renderItem={({item}) => {
                return (
                    <Text>{item.id}</Text>
                )
            }}
            keyExtractor={(item) => item.id}
          />
        {/* <Text>HIIIIIIIIIIIIIIII</Text> */}
      </View>
    </View>
  );
};

/* This works because sentry/react-native wraps sentry/react right now.
* The Sentry Profiler can use any higher-order component but you need redux if you want the `react.update`, 
* because that comes from props being passed into the Profiler (which comes from redux).
* The Profiler doesn't watch the internal state of EmpowerPlant here, and that's why `useState` won't be picked up by sentry sdk, unless you use the Profiler.
* Don't use the Sentry Profiler here yet, because the profiler span was finishing so quick that the transaction would finish prematurely,
* and this was causing Status:Cancelled on that span, and warning "cancelled span due to idleTransaction finishing"
*/
export default ContactInfoScreen

// export const selectImage = (source: string): React.ReactElement => {};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
});
