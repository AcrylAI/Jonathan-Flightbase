import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

const key = ['@src/pages/ProjectMembersPage/hooks/useGetProjectMembers'];

type useGetProjectMembersRequestModel = {
  id: number;
};

function useGetProjectMembers(params: useGetProjectMembersRequestModel) {
  const response = useQuery(
    key,
    fetcher.query({
      method: METHOD.GET,
      url: `/user/project_user_list/${params.id}`,
    }),
  );
  return response;
}

export default useGetProjectMembers;
