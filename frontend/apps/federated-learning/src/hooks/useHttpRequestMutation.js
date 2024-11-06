import { useMutation } from 'react-query';

import { network } from '@src/utils/network';

/**
 * CREATE, UPDATE, DELETE API 요청
 * @param {{
 *  url: string,
 *  method: 'get' | 'post' | 'put' | 'delete',
 *  headers: { key[string]: any },
 * }} requestOption
 * @param {{
 *  mutationKey,
 *  onError,
 *  onMutate,
 *  onSettled,
 *  onSuccess,
 *  retry,
 *  retryDelay,
 *  useErrorBoundary,
 *  meta,
 * }} reactQueryOption
 */
function useHttpRequestMutation(requestOption, reactQueryOption) {
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
  const onMutate = (mutOption) => {
    return mutate(mutOption);
  };

  /**
   * mutation함수 호출
   * @param {{
   *    body: { key[string]: any },
   *    queryString: string,
   * }} mutOption
   * @returns
   */
  const onMutateAsync = (mutOption) => {
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
