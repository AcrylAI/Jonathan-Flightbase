import type { AxiosRequestConfig } from 'axios';

type HttpResponseType = {
  status: 0 | 1;
  code: number | string;
  location: string;
  message: string;
  result: any;
  httpStatus: number;
};

type ApiObjectType = {
  readonly HTTP_REQUEST: (
    param: AxiosRequestConfig,
  ) => Promise<HttpResponseType>;
};

export type { ApiObjectType, HttpResponseType };
