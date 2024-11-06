import { useQuery, RefetchOptions, UseQueryOptions } from 'react-query';

import { network } from '@src/utils/network';

export type QueryRequestOptionModel = {
  url: string;
  headers?: { [key: string]: any };
};

function useHttpRequestQuery(
  queryKey: string[],
  requestOption: QueryRequestOptionModel,
  reactQueryOption: UseQueryOptions,
) {
  const { data, isLoading, error, refetch } = useQuery(
    queryKey,
    async () => network.fetcher({ method: 'get', ...requestOption }),
    reactQueryOption,
  );

  const onRefetch = (mutOption: RefetchOptions) => {
    return refetch(mutOption);
  };

  return {
    data,
    isLoading,
    error,
    onRefetch,
  };
}

export default useHttpRequestQuery;
