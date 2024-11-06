import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';
import { toast } from '@src/components/uiContents/Toast';

function useJoinRequestAccept() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'clients/joined-clients',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    {
      onError: () => {
        toast.error('Network error');
      },
    },
  );

  return {
    onMutateAsync,
  };
}
export default useJoinRequestAccept;
