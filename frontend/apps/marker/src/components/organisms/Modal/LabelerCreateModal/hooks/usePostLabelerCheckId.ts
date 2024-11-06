import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
export type usePostCheckLabelerIdRequestModel = {
  name: string;
};

type usePostCheckLabelerIdResponseModel = {
  duplicated: 0 | 1;
};

const usePostCheckLabelerId = () => {
  return useMutation(
    '@/components/organisism/Modal/LabelerCreateModal/usePostLabelerCheckId',
    fetcher.mut<usePostCheckLabelerIdRequestModel>({
      url: '/user/user_check',
      method: METHOD.POST,
    }),
  );
};
export default usePostCheckLabelerId;
