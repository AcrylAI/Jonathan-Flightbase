import { CreateNewProjectClassModel } from './../../ProjectModal/hooks/useCreateNewProject';
import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

export type usePutEditClassRequestModel = {
  class: Array<CreateNewProjectClassModel>;
  projectId: number;
};
const usePutEditClass = () => {
  return useMutation(
    '@/components/organisms/Modal/ClassEditModal/hooks/usePutEditClass',
    fetcher.mut<usePutEditClassRequestModel>({
      url: '/classes',
      method: METHOD.PUT,
    }),
  );
};
export default usePutEditClass;
