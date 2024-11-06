import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function usePostDataSync() {
  const { mutate, mutateAsync } = useMutation(
    fetcher.mut<{
      projectId: number;
    }>({
      method: METHOD.POST,
      url: '/data/sync',
    }),
  );
  return { mutate, mutateAsync };
}
export default usePostDataSync;
