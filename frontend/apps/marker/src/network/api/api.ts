import { toast } from '@src/components/molecules/Toast';

import { BackendError } from './error';
import type { ApiObjectType, HttpResponseType } from './types';

import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import Cookies from 'universal-cookie';

const API_URL = import.meta.env.VITE_REACT_APP_MARKER_API;
const JSON_HEADER = { 'Content-type': 'application/json' };
const FORM_HEADER = { 'Content-type': 'multipart/form-data' };
const DEFAULT_HEADER = {
  ...JSON_HEADER,
};

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';
const METHOD = { GET, POST, PUT, DELETE };

const markerAxios = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const resChecker = (data: HttpResponseType): boolean => {
  for (let i = 0; i < BackendError.length; i++) {
    if (BackendError[i].code === data.code) {
      // toast.error(`${BackendError[i].message}`);
      const obj = BackendError[i];
      if (obj.fallback !== undefined) {
        // BackendError[i].fallback();
        // eslint-disable-next-line no-unused-expressions
        obj.fallback();
      }
      return false;
    }
  }
  return true;
};

const HTTP_REQUEST = async ({
  url,
  method,
  headers,
  params,
  data,
}: AxiosRequestConfig): Promise<HttpResponseType> => {
  let tmp = {
    code: -1,
    location: '',
    message: '',
  };

  const response: HttpResponseType = await markerAxios({
    url: `${url}`,
    method,
    headers,
    params,
    data,
  })
    .then((response) => {
      const { result, success, error } = response.data;

      const status = response.data.status as 0 | 1;

      if (success) {
        tmp = {
          code: success.code,
          location: success.location,
          message: success.message,
        };
      } else if (error) {
        tmp = {
          code: error.code,
          location: error.location,
          message: error.message,
        };
      }

      const res: HttpResponseType = {
        ...tmp,
        status,
        result: result || {},
        httpStatus: response.status,
      };

      return res;
    })
    .catch((error: AxiosError) => {
      if (error.code === 'ECONNABORTED') {
        toast.api.failed();
      }
      const res: HttpResponseType = {
        ...tmp,
        status: 0,
        message: error.message,
        httpStatus: error.response?.status || -1,
        result: {},
      };

      return res;
    });

  if (!resChecker(response)) {
    response.status = 0;
    return response;
  }
  return response;
};

const api: ApiObjectType = {
  HTTP_REQUEST,
};

const query = (param: AxiosRequestConfig) => (): Promise<HttpResponseType> => {
  const cookies = new Cookies();

  let headers = param.headers ?? DEFAULT_HEADER;
  const TOKEN = window.sessionStorage.getItem('token') ?? '';
  const SESSION = window.sessionStorage.getItem('session') ?? '';
  const AUTHORIZATION = cookies.get('access_token') ?? '';

  if (!headers.token) {
    headers = {
      ...headers,
      token: TOKEN,
      session: SESSION,
    };
  }

  if (
    param.url === '/models/sync' ||
    param.url === '/autolabel/set' ||
    param.url === '/autolabel/run'
  ) {
    headers = {
      ...headers,
      authorization: AUTHORIZATION,
    };
  }

  return api.HTTP_REQUEST({
    ...param,
    headers,
  });
};

const mut =
  <T>(param: AxiosRequestConfig) =>
  (data: T): Promise<HttpResponseType> => {
    let headers = param.headers ?? DEFAULT_HEADER;
    const TOKEN = window.sessionStorage.getItem('token') ?? '';
    const SESSION = window.sessionStorage.getItem('session') ?? '';

    if (!headers.token) {
      headers = {
        ...headers,
        token: TOKEN,
        session: SESSION,
      };
    }

    return api.HTTP_REQUEST({
      ...param,
      headers,
      data: data ?? {},
    });
  };

const fetcher = { query, mut };

export { api, fetcher, METHOD, JSON_HEADER, FORM_HEADER };
