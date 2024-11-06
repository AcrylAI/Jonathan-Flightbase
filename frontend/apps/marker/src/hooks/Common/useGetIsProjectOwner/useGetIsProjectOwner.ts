import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
import { useEffect, useState } from 'react';
type ReqModel = {
  projectId: number;
};

const useGetIsProjectOwner = (params: ReqModel) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const query = useQuery(
    ['@/src/hooks/Common/useGetIsProjectOwner', params.projectId],
    fetcher.query({
      url: '/project/owner',
      method: METHOD.GET,
      params,
    }),
  );

  const checkOwner = (): boolean => {
    if (!query.isLoading) {
      if (query.isSuccess && query.data && query.data.status) {
        return query.data.result.isOwner === 1;
      }
    }
    return false;
  };

  useEffect(() => {
    setIsOwner(checkOwner());
  }, [query.isLoading]);

  return isOwner;
};

export default useGetIsProjectOwner;
