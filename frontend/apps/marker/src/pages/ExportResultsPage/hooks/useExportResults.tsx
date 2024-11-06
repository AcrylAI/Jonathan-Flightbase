import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

type useFilterDataProps = {
  projectId: number;
};

export const useExportData = (params: useFilterDataProps) => {
  const queryData = useQuery(
    ['@/pages/ExportResultsPage/hooks/useExportData'],
    fetcher.query({
      url: '/export',
      method: METHOD.GET,
      params,
    }),
    {
      refetchInterval: 5000,
    },
  );
  return queryData;
};
