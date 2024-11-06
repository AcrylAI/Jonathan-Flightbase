import { METHOD } from '@src/network/api/api';
import { fetcher } from '@src/network/api/api';
import { useMutation } from 'react-query';

export const usePostProjectTitleCheck = () => {
  return useMutation(
    ['@src/components/organisms/modal/ProjectModal/usePostProjectTitleCheck'],
    fetcher.mut({
      url: '/project/check',
      method: METHOD.POST,
    }),
  );
};
