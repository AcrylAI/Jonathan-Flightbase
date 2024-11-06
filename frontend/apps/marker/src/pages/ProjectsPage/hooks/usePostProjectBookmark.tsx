import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

function usePostProjectBookmark(setBookmark: any) {
  const { mutate, mutateAsync, isLoading } = useMutation(
    fetcher.mut<{
      projectId: number;
    }>({
      method: METHOD.POST,
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
export default usePostProjectBookmark;
