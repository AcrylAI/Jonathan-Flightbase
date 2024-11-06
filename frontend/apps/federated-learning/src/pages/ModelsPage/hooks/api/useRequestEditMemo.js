import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useRequestEditMemo() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'models',
      method: 'put',
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

export default useRequestEditMemo;
