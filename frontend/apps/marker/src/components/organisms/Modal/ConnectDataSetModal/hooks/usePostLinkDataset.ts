import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
interface requestModel {
  projectId: number;
  path: string;
  type: 0 | 1;
}
export const usePostLinkDataset = () => {
  return useMutation(
    ['@/src/organisms/Modal/ConnectDatasetModal/usePostLinkDataset'],
    fetcher.mut<requestModel>({
      url: '/data/link',
      method: METHOD.POST,
    }),
  );
};

export type { requestModel as usePostLinkDatasetRequestModel };
