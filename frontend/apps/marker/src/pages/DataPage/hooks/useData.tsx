import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
import { HttpResponseType } from '@src/network/api/types';

type useFilterDataProps = {
  projectId: number;
};

export const usePostDataInfo = (token: string) => {
  return useMutation(
    ['@/pages/DataPage/hooks/usePostDataInfo'],
    fetcher.mut({
      method: METHOD.POST,
      url: 'data/list',
      headers: { token },
    }),
  );
};

export const useFilterData = (params: useFilterDataProps) => {
  const queryData = useQuery(
    ['@/pages/DataPage/hooks/filterData'],
    fetcher.query({
      url: '/data/users',
      method: METHOD.GET,
      params,
    }),
  );
  return queryData.data;
};

export const useProgress = (
  params: useFilterDataProps,
  setData: React.Dispatch<React.SetStateAction<number>>,
) => {
  const [repeat, setRepeat] = useState(false);
  return useQuery(
    ['@/pages/DataPage/hooks/progress'],
    fetcher.query({
      url: '/data/progress',
      method: METHOD.GET,
      params,
    }),
    {
      refetchInterval: repeat ? 1500 : false,
      onSuccess: (data: HttpResponseType) => {
        const { result } = data;
        if (result.progress === 100) setRepeat(false);
        else if (result.progress < 100) setRepeat(true);
        setData(result.progress);
      },
    },
  );
};
