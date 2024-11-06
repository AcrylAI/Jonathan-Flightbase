import { combineReducers } from 'redux';
import auth from './auth';
import modal from './modal';
import confirm from './confirm';
import nav from './nav';
import workspace from './workspace';
import loading from './loading';
import tab from './tab';
import upload from './upload';
import prompt from './prompt';
import progressList from './progressList';
import download from './download';
import breadCrumb from './breadCrumb';
import headerOptions from './headerOptions';
import popup from './popup';

const appReducer = combineReducers({
  auth,
  modal,
  confirm,
  nav,
  workspace,
  loading,
  tab,
  upload,
  prompt,
  progressList,
  download,
  breadCrumb,
  headerOptions,
  popup,
});
const rootReducer = (state, action) => {
  if (
    action.type === 'auth/LOGOUT_REQUEST' ||
    action.type === 'auth/RESET_STATE'
  )
    return appReducer(undefined, action);
  return appReducer(state, action);
};

export default rootReducer;
