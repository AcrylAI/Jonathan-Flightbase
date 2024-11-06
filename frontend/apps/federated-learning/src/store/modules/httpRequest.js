import { handleActions, createAction } from 'redux-actions';

import { network } from '@src/utils/network';
// import { deepCopy } from '@src/utils/utils';

// http 요청 redux

// action
// 요청, 성공, 실패, 특정 타입(어떤 요청인지) 데이터 삭제, 데이터 전체 삭제
const HTTP_REQUEST = 'httpRequest/HTTP_REQUEST';
const HTTP_SUCCESS = 'httpRequest/HTTP_SUCCESS';
const HTTP_FAILURE = 'httpRequest/HTTP_FAILURE';
const HTTP_DATA_DELETE = 'httpRequest/HTTP_DELETE_DATA';
const HTTP_DATA_CLEAR = 'httpRequest/HTTP_DATA_CLEAR';

export const httpRequest = createAction(HTTP_REQUEST);
export const httpSuccess = createAction(HTTP_SUCCESS);
export const httpFailure = createAction(HTTP_FAILURE);
export const httpDeleteData = createAction(HTTP_DATA_DELETE);
export const httpDataClear = createAction(HTTP_DATA_CLEAR);

const INIT_STATE = {};

export default handleActions(
  {
    [HTTP_REQUEST]: (state, { payload: type }) => {
      return {
        ...state,
        [type]: {
          loading: true,
          error: null,
          response: null,
        },
      };
    },
    [HTTP_SUCCESS]: (state, { payload: { type, response } }) => {
      return {
        ...state,
        [type]: {
          loading: false,
          error: null,
          response,
        },
      };
    },
    [HTTP_FAILURE]: (state, { payload: { type, error } }) => {
      return {
        ...state,
        [type]: {
          loading: false,
          response: null,
          error,
        },
      };
    },
    [HTTP_DATA_DELETE]: (state, { payload: type }) => {
      const newState = {
        ...state,
      };

      if (Array.isArray(type)) {
        type.forEach((t) => {
          delete newState[t];
        });
      } else {
        delete newState[type];
      }

      return newState;
    },
    [HTTP_DATA_CLEAR]: () => ({}),
  },
  INIT_STATE,
);

/**
 *
 * @param {{
 * type: string,
 * url: string,
 * method: string,
 * headers: Object,
 * body: Object
 * }} param0
 * @returns
 */
export const httpRequestMiddleware =
  ({ type, url, method, headers, body }) =>
  async (dispatch) => {
    dispatch(httpRequest(type));
    try {
      const response = await network.module_callapi({
        url,
        method,
        headers,
        body,
      });
      dispatch(httpSuccess({ type, response }));
    } catch (e) {
      dispatch(httpFailure({ type, error: e }));
    }
  };

// export const testMiddleware = (info = []) => {
//   return async function* ({ dispatch, url }) {
//     let cache = {};
//     for (let i = 0; i < info.length; i++) {
//       const { type, method, headers, body } = info[i];
//       dispatch(httpRequest(type));
//       try {
//         const response = await network.callApi({ url, method, headers, body });
//         dispatch(httpSuccess({ type, response }));
//         yield response;
//       } catch (e) {
//         dispatch(httpFailure({ type, error: e }));
//         yield e;
//       }
//     }
//   };
// };
