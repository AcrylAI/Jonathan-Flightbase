import { addDecorator } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '@src/store';
export const parameters = { layout: 'fullscreen' };

import '@jonathan/ui-style/build/index.css';
import './index.css';
// storybook webpack에서 @import로 가져온 css는 module 적용이 안됨 (해결 방법 찾는 중....)

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancer());

addDecorator((Story) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/']}>
      <Story />
    </MemoryRouter>
  </Provider>
));
