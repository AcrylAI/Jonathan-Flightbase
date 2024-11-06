// Polyfill
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import smoothscroll from 'smoothscroll-polyfill';
import elementClosest from 'element-closest';

// import 'core-js/fn/array/find';
// import 'core-js/fn/array/includes';
// import 'core-js/fn/number/is-nan';

// React modules
import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

// Global style
import './styles/style.scss';
import Root from './Root';
import * as serviceWorker from './serviceWorker';

import { Buffer } from 'buffer';

import '@jonathan/ui-react/build/index.css';

window.Buffer = Buffer;

// Apply Polyfill modules
smoothscroll.polyfill();
elementClosest(window);

// React render
// ReactDOM.render(<Root />, document.getElementById('root'));
const root = createRoot(document.getElementById('root'));
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
