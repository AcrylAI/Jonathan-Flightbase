import { useQuery } from 'react-query';

import { network } from '@src/utils/network';

/**
 * READ API 요청
 * @param {Array<string>} queryKey
 * @param {{
 *  url: string,
 *  headers: { key[string]: any },
 * }} requestOption
 * @param {{
 *  cacheTime: number,
 *  staleTime: number,
 *  onSuccess: (data: unknown) => void,
 *  onError: (error: unknown) => void,
 *  onSettled: (data?: unknown, error?: unknown),
 *  enabled: boolean,
 *  select: (data: unknown) => unknown,
 *  refetchInterval: number | false | ((data: TData | undefined, query: Query) => number | false),
 *  refetchIntervalInBackground: boolean,
 *  refetchOnMount: boolean | 'always' | ((query: Query) => boolean | 'always'),
 *  refetchOnWindowFocus: boolean | 'always' | ((query: Query) => boolean | 'always'),
 *  refetchOnReconnect: boolean | 'always' | ((query: Query) => boolean | 'always'),
 *  retry: boolean | number | (failureCount: number,. error: TError) = > boolean
 *  retryOnMount: boolean,
 *  retryDelay: number | (retryAttempt: number, error: TError) => number,
 * }} reactQueryOption
 */
function useHttpRequestQuery(queryKey, requestOption, reactQueryOption) {
  const { data, isLoading, error, refetch } = useQuery(
    queryKey,
    network.fetcher({ method: 'get', ...requestOption }),
    reactQueryOption,
  );

  const onRefetch = () => {
    return refetch();
  };

  return {
    data,
    isLoading,
    error,
    onRefetch,
  };
}

export default useHttpRequestQuery;
