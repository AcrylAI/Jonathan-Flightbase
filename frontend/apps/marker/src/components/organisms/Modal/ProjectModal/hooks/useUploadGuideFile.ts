import { fetcher, FORM_HEADER, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
export const useUploadGuideFile = () => {
  return useMutation(
    [
      '@/component/organisms/Modal/Content/ProjectModal/hooks/useUploadGuideFile',
    ],
    fetcher.mut({
      url: '/project/guide',
      method: METHOD.POST,
      headers: {
        ...FORM_HEADER,
      },
    }),
  );
};
