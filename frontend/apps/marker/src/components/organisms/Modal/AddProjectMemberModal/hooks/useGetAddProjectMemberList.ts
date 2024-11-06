import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type requestModel = {
  workspaceId: number;
  projectId: number;
};
const useGetAddMemberList = (params: requestModel) => {
  return useQuery(
    ['@/components/organisms/Modal/AddProjectMemberModal/useGetAddMemberList'],
    fetcher.query({
      url: '/user/project_user_add_list',
      method: METHOD.GET,
      params,
    }),
  );
};
export type { requestModel as useGetAddMemberListRequestModel };
export default useGetAddMemberList;
