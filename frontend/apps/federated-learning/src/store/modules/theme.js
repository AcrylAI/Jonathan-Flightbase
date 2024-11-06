import { handleActions, createAction } from 'redux-actions';

const GET_THEME = 'theme/GET_THEME';
const SET_THEME = 'theme/SET_THEME';

export const getTheme = createAction(GET_THEME);
export const setTheme = createAction(SET_THEME);

const INIT_STATE = {
  theme: 'jp-dark',
};

export default handleActions(
  {
    [GET_THEME]: (state) => state.theme,
    [SET_THEME]: (state, { payload: theme }) => ({
      ...state,
      theme,
    }),
  },
  INIT_STATE,
);
