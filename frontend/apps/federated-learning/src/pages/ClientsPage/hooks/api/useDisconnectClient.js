import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useDisconnectClient() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/clients/disconnect',
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

  return { onMutateAsync };
}

export default useDisconnectClient;
