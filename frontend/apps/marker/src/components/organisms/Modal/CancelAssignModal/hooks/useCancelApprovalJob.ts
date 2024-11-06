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

const useCancelApprovalJob = () => {
  return useMutation(
    ['@/components/organisms/Modal/CancelAssignModal/useCancelApprovalJob'],
    fetcher.mut<requestModel>({
      url: '/job/cancelApproval',
      method: METHOD.POST,
    }),
  );
};
export type { requestModel as useCancelApprovalJobRequestModel };
export default useCancelApprovalJob;
