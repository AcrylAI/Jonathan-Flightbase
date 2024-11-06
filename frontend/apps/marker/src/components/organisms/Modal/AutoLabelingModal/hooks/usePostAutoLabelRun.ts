import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

export type usePostAutoLabelRunRequestModel = {
  projectId: number;
  dataType: number;
  keepData: number;
  dataCnt: number;
};
const usePostAutoLabelRun = () => {
  return useMutation(
    ['@/components/organisms/Modal/AutoLabelingModal/usePostAutoLabelRun'],
    fetcher.mut<usePostAutoLabelRunRequestModel>({
      url: '/autolabel/run',
      method: METHOD.POST,
    }),
  );
};
export default usePostAutoLabelRun;
