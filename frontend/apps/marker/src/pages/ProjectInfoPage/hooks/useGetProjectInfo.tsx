import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

const key: Array<string | number> = ['@src/hooks/Api/useGetProjetInfo'];

type useGetProjectInfoRequestModel = {
  id: number;
};

function useGetProjectInfo(params: useGetProjectInfoRequestModel) {
  const [enabled, setEnabled] = useState<boolean>(true);

  const response = useQuery(
    [...key, params.id],
    fetcher.query({
      method: METHOD.GET,
      url: `/project`,
      params,
    }),
    {
      refetchInterval: 5000,
      enabled,
    },
  );

  useEffect(() => {
    const sync = response.data?.result.datasetInfo?.dataSync ?? 0;
    setEnabled(sync === 1);
  }, [response.data?.result.datasetInfo?.dataSync]);

  return response;
}

export default useGetProjectInfo;
