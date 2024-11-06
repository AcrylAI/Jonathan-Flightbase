import { useQuery } from 'react-query';
import { fetcher, METHOD } from '@src/network/api/api';

const key = ['@src/hooks/Api/useGetProjectUserDetail'];

type useGetProjectUserDetailRequestModel = {
  projectId: number;
  id?: number;
};

function useGetProjectUserDetail(params: useGetProjectUserDetailRequestModel) {
  return useQuery(
    key.concat([
      params.id ? String(params.id) : '-1',
      String(params.projectId),
    ]),
    fetcher.query({
      method: METHOD.GET,
      url: '/user/project_user_detail',
      params,
    }),
    {
      enabled: !Number.isNaN(params.projectId),
    },
  );
}

export default useGetProjectUserDetail;
