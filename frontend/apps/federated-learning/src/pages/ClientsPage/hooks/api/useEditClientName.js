import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';
import { toast } from '@src/components/uiContents/Toast';

function useEditClientName() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'clients/joined-clients/name',
      method: 'put',
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

export default useEditClientName;
