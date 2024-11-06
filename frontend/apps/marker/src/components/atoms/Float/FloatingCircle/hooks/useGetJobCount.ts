import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type ReqModel = {
  projectId: number;
  disable: boolean;
};

export const useGetJobCount = (params: ReqModel) => {
  const _enabled = (params.disable) ? false : (!!params.projectId);

  return useQuery(
    '@src/components/atoms/Float/FloatingCircle/useGetJobCount',
    fetcher.query({
      url: '/job/count',
      method: METHOD.GET,
      params,
    }),
    {
      refetchInterval: 3000,
      enabled: _enabled,
    },
  );
};
