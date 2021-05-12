import {createStore} from 'redux';
import * as Sentry from '@sentry/react';
import CartScreen from './screens/CartScreen';

const initialState = {
  counter: 0,
  cart:{},
};

const reducer = (state = initialState, action) => {
  let {payload,type} = action;
  switch (type) {
    case 'ADD_TO_CART':
      if(state.cart[payload.sku]){
        return {
          ...state,
          cart:{
            ...state.cart,
            [payload.sku]:{
              ...state.cart[payload.sku],
              quantity:state.cart[payload.sku].quantity + 1
            }
          }
          
        };
      }
      return {
        ...state,
        cart: {...state.cart,[action.payload.sku]:action.payload}
      };
    case 'DELETE_FROM_CART':
      delete state.cart[action.payload]
      return {
        ...state,
        cart:{...state.cart}
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
