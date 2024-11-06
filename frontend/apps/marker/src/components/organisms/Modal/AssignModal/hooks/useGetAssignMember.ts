import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type useGetAssignMemberRequestModel = {
  projectId: number;
};
export type useGetAssignMemberModel = {
  id: number;
  name: string;
  labeling: number;
  review: number;
  type: 1 | 2;
};
export const useGetAssignMember = (params: useGetAssignMemberRequestModel) => {
  return useQuery(
    '@/components/Modal/AssignModal/hooks/useGetAssignMember',
    fetcher.query({
      url: '/user/data_assign',
      method: METHOD.GET,
      params,
    }),
  );
};
