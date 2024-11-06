import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

export type useGetDataSetListProps = {
  workspaceId: number;
  type: number;
  path?: string;
};
export const useGetDataSetList = (params: useGetDataSetListProps) => {
  const queryData = useQuery(
    [
      '@components/organisms/Modal/common/Content/ConnectDataSetContent/useGetDataSetList',
      params.workspaceId,
    ],
    fetcher.query({
      url: '/data/link',
      method: METHOD.GET,
      params,
    }),
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  return queryData;
};
