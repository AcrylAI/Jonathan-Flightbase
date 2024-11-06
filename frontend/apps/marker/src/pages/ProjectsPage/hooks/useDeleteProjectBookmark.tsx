import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function useDeleteProjectBookmark(setBookmark: any) {
  const { mutate, mutateAsync, isLoading } = useMutation(
    fetcher.mut<{
      projectId: number;
    }>({
      method: METHOD.DELETE,
      url: '/project/bookmark',
    }),
    {
      onSuccess: (data) => {
        setBookmark(data);
      },
      onError: () => {},
      onSettled: () => {},
    },
  );
  return { mutate, mutateAsync };
}
export default useDeleteProjectBookmark;
