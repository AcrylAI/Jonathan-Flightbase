import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import Root from './Root';

import './index.css';
import './styles/style.scss';

import '@jonathan/ui-react/build/index.css';

// ReactDOM.render(<Root />, document.getElementById('root'));
const root = createRoot(document.getElementById('root'));
root.render(<Root />);
