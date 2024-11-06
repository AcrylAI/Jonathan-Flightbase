/* eslint-disable camelcase */
import axios, { AxiosRequestConfig } from 'axios';

export interface CallApiModel extends AxiosRequestConfig {
  body: { [key: string]: any };
  queryString?: string;
}
export const network = (() => {
  const callApi = async ({ url, method, headers, body }: CallApiModel) => {
    const res = await axios({
      url,
      method,
      headers,
      data: body,
    })
      .then((res) => res)
      .catch(() => ({
        data: {
          status: 0,
          message: 'Network error',
        },
      }));
    return res;
  };

  const module_callapi = async ({
    url,
    method,
    headers,
    body,
  }: CallApiModel) => {
    const res = await axios({
      url,
      method,
      headers,
      data: body,
    });
    return res;
  };

  const fetcher =
    ({ url, method, headers }: AxiosRequestConfig) =>
    async ({ body, queryString }: CallApiModel) => {
      let u = url;
      if (queryString) {
        u = `${url}?${queryString}`;
      }

      const res = await axios({
        url: u,
        method,
        headers,
        data: body,
      });
      return res;
    };

  return {
    callApi,
    module_callapi,
    fetcher,
  };
})();
