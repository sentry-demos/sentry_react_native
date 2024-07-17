import {createStore} from 'redux';
import * as Sentry from '@sentry/react-native';

const initialState = {
  counter: 0,
  cart: {},
  contactInfo: {
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    countryRegion: '',
    state: '',
    zipCode: '',
  },
  feedback: {
    isActionButtonVisible: false,
  },
};

const reducer = (state = initialState, action) => {
  let {payload, type, onScope} = action;

  switch (type) {
    case 'FILL_FIELDS':
      if (payload === 'dummydata') {
        return {
          ...state,
          contactInfo: {
            email: onScope
              ? onScope
              : Math.random().toString(36).substring(2, 6) + '@yahoo.com',
            firstName: 'john',
            lastName: 'doe',
            address: '123 Hope St',
            city: 'San Francisco',
            countryRegion: 'USA',
            state: 'CA',
            zipCode: (Math.floor(Math.random() * 90000) + 10000).toString(),
          },
        };
      } else {
        return {...state};
      }
    case 'ADD_TO_CART':
      if (state.cart[payload.id]) {
        return {
          ...state,
          cart: {
            ...state.cart,
            [payload.id]: {
              ...state.cart[payload.id],
              quantity: state.cart[payload.id].quantity + 1,
            },
          },
        };
      }
      return {
        ...state,
        cart: {...state.cart, [action.payload.id]: action.payload},
      };
    case 'DELETE_FROM_CART':
      delete state.cart[action.payload];
      return {
        ...state,
        cart: {...state.cart},
      };
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
    case 'SHOW_FEEDBACK_ACTION_BUTTON':
      return {
        ...state,
        feedback: {...state.feedback, isActionButtonVisible: true},
      };
    case 'HIDE_FEEDBACK_ACTION_BUTTON':
      return {
        ...state,
        feedback: {...state.feedback, isActionButtonVisible: false},
      };
    default:
      return state;
  }
};

export const showFeedbackActionButton = () => ({
  type: 'SHOW_FEEDBACK_ACTION_BUTTON',
});

export const hideFeedbackActionButton = () => ({
  type: 'HIDE_FEEDBACK_ACTION_BUTTON',
});

/*
  Example of how to use the Sentry redux enhancer packaged with @sentry/react:
*/

const sentryEnhancer = Sentry.createReduxEnhancer();

const store = createStore(reducer, sentryEnhancer);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export {store};
