import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
export type usePostCreateLabelerRequestModel = {
  workspaceId: number;
  name: string;
  password: string;
  memo: string;
};

const usePostCreateLabeler = () => {
  return useMutation(
    '@/components/organisism/Modal/LabelerCreateModal/usePostCreateLabeler',
    fetcher.mut<usePostCreateLabelerRequestModel>({
      url: '/user',
      method: METHOD.POST,
    }),
  );
};
export default usePostCreateLabeler;
