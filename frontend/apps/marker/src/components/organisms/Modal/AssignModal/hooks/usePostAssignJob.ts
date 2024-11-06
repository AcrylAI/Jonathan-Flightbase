import { fetcher, METHOD } from '@src/network/api/api';
import { FilterDataType } from '@src/utils/types/data';
import { useMutation } from 'react-query';
export type usePostAssignJobMemberModel = {
  id: number;
  count: number;
};
export type usePostAssignJobRequestModel = {
  projectId: number;
  notAssignId: Array<number>;
  assignId: Array<number>;
  flag: number;
  labeling: Array<usePostAssignJobMemberModel>;
  review: Array<usePostAssignJobMemberModel>;
  filter: Array<FilterDataType>;
};
export const usePostAssignJob = () => {
  return useMutation(
    '@/components/organisms/Modal/AssignModal/hooks/usePostAssignJob',
    fetcher.mut<usePostAssignJobRequestModel>({
      url: '/job/assign',
      method: METHOD.POST,
    }),
  );
};
