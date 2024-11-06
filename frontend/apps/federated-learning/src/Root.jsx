import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './store';

// Components
import App from './App';

// i18n
import './i18n';
import { Loading } from '@jonathan/ui-react';

const { store, persistor } = configureStore;

function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </PersistGate>
    </Provider>
  );
}

export default Root;
