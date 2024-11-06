import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function usePutProjectDesc() {
  const { mutate, mutateAsync, isLoading } = useMutation(
    fetcher.mut<{
      projectId: number;
      description: string;
    }>({
      method: METHOD.PUT,
      url: '/project',
    }),
  );
  return { mutate, mutateAsync, isLoading };
}
export default usePutProjectDesc;
