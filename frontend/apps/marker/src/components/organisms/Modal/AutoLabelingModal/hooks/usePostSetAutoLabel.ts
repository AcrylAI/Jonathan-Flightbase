import { MatchClassModel } from './../../../../../stores/components/Modal/SetAutoLabelModalAtom';
import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

export type ReqModel = {
  projectId: number;
  classList: Array<MatchClassModel>;
};
const usePostSetAutoLabel = () => {
  return useMutation(
    ['@/components/organisms/Modal/AutoLabelingModal/usePostAutoLabelRun'],
    fetcher.mut<ReqModel>({
      url: '/autolabel/set',
      method: METHOD.POST,
    }),
  );
};
export default usePostSetAutoLabel;
