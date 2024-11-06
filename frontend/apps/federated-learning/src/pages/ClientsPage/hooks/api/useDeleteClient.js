import { toast } from '@src/components/uiContents/Toast';
import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

function useDeleteClient() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'clients/joined-clients',
      method: 'delete',
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

export default useDeleteClient;
