import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function useDeleteGuideFile() {
  return useMutation(
    fetcher.mut<{
      id: number;
    }>({
      method: METHOD.DELETE,
      url: '/project/guide',
    }),
  );
}
export default useDeleteGuideFile;
