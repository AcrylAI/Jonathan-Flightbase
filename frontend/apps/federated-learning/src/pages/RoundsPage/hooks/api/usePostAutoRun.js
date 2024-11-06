import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function usePostAutoRun() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'rounds/round/auto-run',
      method: 'post',
    },
    {
      onError: () => {
        toast.error('Network error');
      },
    },
  );

  return { onMutateAsync };
}

export default usePostAutoRun;
