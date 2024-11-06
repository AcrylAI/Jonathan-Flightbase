import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';
function useRequestAutoRound({ getRoundProgress }) {
  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['rounds/round/auto-run'],
    {
      url: 'rounds/round/auto-run',
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        if (status === 1) {
          getRoundProgress(result);
        } else {
          toast.error(message);
        }
      },
      onError: () => {
        toast.error('Network error');
      },
    },
  );
  return {
    data,
    error,
    isLoading,
    onRefetch,
  };
}
export default useRequestAutoRound;
