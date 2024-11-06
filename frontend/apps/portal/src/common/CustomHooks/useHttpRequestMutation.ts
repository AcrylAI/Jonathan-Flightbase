import { AxiosRequestConfig } from 'axios';
import { useMutation } from 'react-query';

import { CallApiModel, network } from '@src/utils/network';

function useHttpRequestMutation(
  requestOption: AxiosRequestConfig,
  reactQueryOption: any,
) {
  const { data, isLoading, error, mutate, mutateAsync } = useMutation(
    network.fetcher(requestOption),
    reactQueryOption,
  );

  /**
   * mutation함수 호출
   * @param {{
   *    body: { key[string]: any },
   *    queryString: string,
   * }} mutOption
   * @returns
   */
  const onMutate = (mutOption: CallApiModel) => {
    return mutate(mutOption);
  };

  const onMutateAsync = (mutOption: CallApiModel) => {
    return mutateAsync(mutOption);
  };

  return {
    data,
    isLoading,
    error,
    onMutate,
    onMutateAsync,
  };
}

export default useHttpRequestMutation;
