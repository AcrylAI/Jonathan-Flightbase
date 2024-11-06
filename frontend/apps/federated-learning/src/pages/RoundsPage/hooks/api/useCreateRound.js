import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';
import { toast } from '@src/components/uiContents/Toast';

function useCreateRound() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'rounds/round',
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

export default useCreateRound;
