import {createStore} from 'redux';
import * as Sentry from '@sentry/react';
import CartScreen from './screens/CartScreen';

const initialState = {
  counter: 0,
  cart:{},
  cart1: {},
};

const reducer = (state = initialState, action) => {
  let {payload,type} = action;
  // console.log("> reducer action", action)
  switch (type) {
    case 'FILL_FIELDS':
      console.log("filling", payload)
      if (payload == 'dummydata') {
        return { ...state };
      } else {
        return { ...state };
      }
    case 'ADD_TO_CART':
      // replaced sku w/ id
      // if(state.cart[payload.id]){
      //   return {
      //     ...state,
      //     cart:{
      //       ...state.cart,
      //       [payload.id]:{
      //         ...state.cart[payload.id],
      //         quantity:state.cart[payload.id].quantity + 1
      //       }
      //     }
          
      //   };
      // }
      // return {
      //   ...state,
      //   cart: {...state.cart,[action.payload.id]:action.payload}
      // };
      if(state.cart1[payload.id]){
        return {
          ...state,
          cart1:{
            ...state.cart1,
            [payload.id]:{
              ...state.cart1[payload.id],
              quantity:state.cart1[payload.id].quantity + 1
            }
          }
          
        };
      }
      return {
        ...state,
        cart1: {...state.cart1,[action.payload.id]:action.payload}
      };
    case 'DELETE_FROM_CART':
      delete state.cart1[action.payload]
      return {
        ...state,
        cart1:{...state.cart1}
      }
    case 'COUNTER_INCREMENT':
      return {
        ...state,
        counter: state.counter + 1,
      };
    case 'COUNTER_RESET':
      return {
        ...state,
        counter: 0,
      };
    default:
      return state;
  }
};

/*
  Example of how to use the Sentry redux enhancer packaged with @sentry/react:
*/

const sentryEnhancer = Sentry.createReduxEnhancer();

const store = createStore(reducer, sentryEnhancer);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export {store};
