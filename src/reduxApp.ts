import {createStore} from 'redux';
import * as Sentry from '@sentry/react';
import CartScreen from './screens/CartScreen';

const initialState = {
  counter: 0,
  cart:{},
  cart1: {},
  contactInfo: {
    email:"",
    firstName:"",
    lastName:"",
    address:"",
    city:"",
    countryRegion:"",
    state:"",
    zipCode:"",
  }
};

const reducer = (state = initialState, action) => {
  let {payload,type} = action;

  switch (type) {
    case 'FILL_FIELDS':
      if (payload == 'dummydata') {
        console.log(">FILL_FIELDS")
        return { 
          ...state, 
          contactInfo: {
            email:"random123@email.com",
            firstName:"john",
            lastName:"doe",
            address:"123 Hope St",
            city:"San Francisco",
            countryRegion:"USA",
            state:"CA",
            zipCode:"123456",
          }
        };
      } else {
        console.log(">BADDDDDDDDDDDD")
        return { ...state };
      }
    case 'ADD_TO_CART':
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
