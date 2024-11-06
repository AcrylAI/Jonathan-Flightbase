import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import thunkMiddleware from 'redux-thunk';
import modules from './modules';
import customHistory from '../customHistory';

const composeEnhancer =
  (import.meta.env.VITE_REACT_APP_ENVIRONMENT !== 'live' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const persistConfig = {
  key: 'root',
  storage: storageSession,
  blacklist: [
    'modal',
    'confirm',
    'nav',
    'loading',
    'upload',
    'tab',
    'progressList',
    'prompt',
    'download',
    'breadCrumb',
    'headerOptions',
    'popup',
  ],
};

const enhancerReducer = persistReducer(persistConfig, modules);

const store = createStore(
  enhancerReducer,
  composeEnhancer(
    applyMiddleware(
      thunkMiddleware.withExtraArgument({ history: customHistory }),
    ),
  ),
);

const persistor = persistStore(store);
const stores = { store, persistor };
export default stores;
