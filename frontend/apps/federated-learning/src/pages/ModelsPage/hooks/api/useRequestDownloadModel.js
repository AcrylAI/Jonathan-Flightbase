import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useRequestDownloadModel() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'models/download',
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    {
      onError: (e) => {
        toast.error('Network error', e);
      },
    },
  );

  return {
    onMutateAsync,
  };
}

export default useRequestDownloadModel;
