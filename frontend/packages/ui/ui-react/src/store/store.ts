import { combineReducers } from 'redux';
import modal from './modules';
import fmodal from './modules/flexibleModal';

const rootReducer = combineReducers({
  modal,
  fmodal,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
