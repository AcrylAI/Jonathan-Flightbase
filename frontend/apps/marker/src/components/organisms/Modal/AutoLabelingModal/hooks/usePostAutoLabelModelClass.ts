import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
type ReqModel = {
  modelId: number;
};
const usePostAutoLabelModelClass = () => {
  return useMutation(
    ['@/components/organisms/Modal/AutoLabelingModal/useGetAutoLabelData'],
    fetcher.mut<ReqModel>({
      url: '/autolabel/model_class',
      method: METHOD.POST,
    }),
  );
};

export default usePostAutoLabelModelClass;
