import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useRequestMetricData({ metricDataHandler }) {
  const { data, error, isLoading, onMutateAsync } = useHttpRequestMutation(
    {
      method: 'get',
      url: 'dashboard/global_model_metric',
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        if (status === 1) {
          metricDataHandler(result);
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
    onMutateAsync,
  };
}

export default useRequestMetricData;
