import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

/**
 * 라운드 상세페이지 - Aggregation HPS Chart Data
 * @param
 */
function useRequestHpsLogData() {
  const { data, error, isLoading, onMutateAsync } = useHttpRequestMutation(
    {
      method: 'get',
      url: 'rounds/aggregation/hps-item-log',
    },
    {
      onSuccess: (response) => {
        const { data } = response;
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
    onMutateAsync,
  };
}

export default useRequestHpsLogData;
