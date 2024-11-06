import axios from 'axios';

export const network = (() => {
  const callApi = async ({ url, method, headers, body }) => {
    return await axios({
      url,
      method: String(method).toLowerCase(),
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
  };

  const module_callapi = async ({ url, method, headers, body }) => {
    return await axios({
      url,
      method: String(method).toLowerCase(),
      headers,
      data: body,
    });
  };

  /**
   * react-query fetcher 함수
   * @param {{
   *  url: string,
   *  method: string,
   *  headers: {
   *    [key: string]: any,
   *  }
   * }} param0
   * @param {{
   *   body: {
   *    [key: string]: any,
   *   },
   *  queryString: string,
   * }} param1
   * @returns
   */
  const fetcher =
    ({ url, method, headers }) =>
    async ({ body, queryString }) => {
      let u = url;
      if (queryString) {
        u = `${url}?${queryString}`;
      }
      return await axios({
        url: u,
        method: String(method).toLowerCase(),
        headers,
        data: body,
      });
    };
  return {
    callApi,
    module_callapi,
    fetcher,
  };
})();
