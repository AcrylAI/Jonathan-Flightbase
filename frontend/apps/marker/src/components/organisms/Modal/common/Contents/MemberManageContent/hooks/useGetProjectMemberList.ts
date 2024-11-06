import { useQuery } from 'react-query';
import { fetcher, METHOD } from '@src/network/api/api';
type useGetProjectMemberAddListProps = {
  workspaceId: number;
  projectId?: number;
};

export type WorkspaceUserListResponseModel = {
  id: number;
  name: string;
  type: number;
  participateProject: number;
  manageProject: number;
  labelingData: number;
  reviewData: number;
};

export const useGetProjectMemberAddList = (
  params: useGetProjectMemberAddListProps,
) => {
  const queryData = useQuery(
    [
      '@components/Modal/common/Contents/MemberManageContent/useGetProjectMemberList',
    ],
    fetcher.query({
      url: '/user/project_user_add_list',
      method: METHOD.GET,
      params,
    }),
  );

  return queryData;
};
