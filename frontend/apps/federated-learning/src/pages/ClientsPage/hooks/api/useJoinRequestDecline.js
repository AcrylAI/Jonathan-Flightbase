import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';
import { toast } from '@src/components/uiContents/Toast';

function useJoinRequestDecline() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'clients/join-request-clients',
      method: 'delete',
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
export default useJoinRequestDecline;
