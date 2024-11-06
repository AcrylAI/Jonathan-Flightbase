import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

type requestModel = {
  id?: number;
  name?: string;
  password: string;
  memo?: string;
};
function usePostLabelerEdit() {
  return useMutation(
    ['@/components/organisms/Modal/LabelerEditModal/usePostLabelerEdit'],
    fetcher.mut<requestModel>({
      url: '/user',
      method: METHOD.PUT,
    }),
  );
}

export type { requestModel as labelerEditRequestModel };
export default usePostLabelerEdit;
