import { useMutation } from 'react-query';
import { fetcher, METHOD } from '@src/network/api/api';

function usePutDataAutoSync() {
  const { mutate, mutateAsync, isLoading } = useMutation(
    fetcher.mut<{
      projectId: number;
      sync: number;
    }>({
      method: METHOD.PUT,
      url: '/data/edit',
    }),
  );
  return { mutate, mutateAsync };
}
export default usePutDataAutoSync;
