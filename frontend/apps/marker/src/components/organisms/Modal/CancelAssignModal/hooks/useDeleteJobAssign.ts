import { fetcher, METHOD } from '@src/network/api/api';
import { FilterDataType } from '@src/utils/types/data';
import { useMutation } from 'react-query';
type requestModel = {
  projectId: number;
  cancelId: Array<number>;
  notCancelId: Array<number>;
  flag: number;
  filter: Array<FilterDataType>;
};

const useDeleteJobAssign = () => {
  return useMutation(
    ['@/components/organisms/Modal/CancelAssignModal/useDeleteJobAssign'],
    fetcher.mut<requestModel>({
      url: '/job/assign',
      method: METHOD.DELETE,
    }),
  );
};
export type { requestModel as useDeleteJobAssignRequestModel };
export default useDeleteJobAssign;
