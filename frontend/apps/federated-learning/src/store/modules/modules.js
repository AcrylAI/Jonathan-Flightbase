import { combineReducers } from 'redux';

import tab from './tab';
import modal from './modal';
import theme from './theme';
import httpRequest from './httpRequest';

const appReducer = combineReducers({ tab, modal, theme, httpRequest });

const rootReducer = (state, action) => appReducer(state, action);

export default rootReducer;
