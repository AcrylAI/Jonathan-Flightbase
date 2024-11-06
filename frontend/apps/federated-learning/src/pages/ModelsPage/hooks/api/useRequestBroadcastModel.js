import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useRequestBroadcastModel() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'models/broadcast/send',
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

export default useRequestBroadcastModel;
