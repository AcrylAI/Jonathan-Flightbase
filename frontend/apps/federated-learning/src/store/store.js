import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import thunk from 'redux-thunk';
import modules from './modules';

const composeEnhancer =
  (import.meta.env.VITE_REACT_APP_ENVIRONMENT !== 'live' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const persistConfig = {
  key: 'root',
  storage: storageSession,
  blacklist: ['tab', 'modal', 'theme', 'httpRequest'],
};

const enhancerReducer = persistReducer(persistConfig, modules);

const store = createStore(
  enhancerReducer,
  composeEnhancer(applyMiddleware(thunk)),
);

const persistor = persistStore(store);
const stores = { store, persistor };

export default stores;
