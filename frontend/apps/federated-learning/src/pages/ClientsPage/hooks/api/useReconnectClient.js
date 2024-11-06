import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useReconnectClient() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/clients/reconnect,',
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

export default useReconnectClient;
