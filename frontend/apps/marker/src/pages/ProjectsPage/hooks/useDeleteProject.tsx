import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function useDeleteProject() {
  return useMutation(
    fetcher.mut<{
      id: number;
    }>({
      method: METHOD.DELETE,
      url: '/project',
    }),
  );
}
export default useDeleteProject;
