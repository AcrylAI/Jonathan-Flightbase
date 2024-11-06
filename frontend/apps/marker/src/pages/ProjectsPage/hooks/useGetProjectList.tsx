import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

const key = ['@src/Api/hooks/useGetProjectList'];

export type useGetProjectListRequestModel = {
  filter1?: 0 | 1 | 2; // 권한
  filter2?: 0 | 1 | 2; // 활성화 상태
  search?: string;
  workspaceId: number;
  // page?: number;
};

function useGetProjectList(params: useGetProjectListRequestModel) {
  const response = useQuery(
    [...key, params.workspaceId, params.filter1, params.filter2],
    fetcher.query({
      method: METHOD.GET,
      url: `/project/list`,
      params,
    }),
  );

  return response;
}

export default useGetProjectList;
