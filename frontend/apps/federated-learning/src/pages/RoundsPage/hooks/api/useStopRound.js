import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useStopRound() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'rounds/round/stop',
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

export default useStopRound;