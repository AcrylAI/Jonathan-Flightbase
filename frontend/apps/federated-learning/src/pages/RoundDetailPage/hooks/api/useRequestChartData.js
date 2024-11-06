import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

/**
 * 라운드 상세페이지 - Aggregation HPS Chart Data
 * @param
 */
function useRequestCharData(getAggregationChartData) {
  const { data, error, isLoading, onMutateAsync } = useHttpRequestMutation(
    {
      method: 'get',
      url: 'rounds/round/detail/hps-line-stack-chart',
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;

        const newHpsChartData = [];
        result?.client_ratio_by_round?.forEach((data, idx) =>
          newHpsChartData.push({ ...data, idx }),
        );
        getAggregationChartData(newHpsChartData);
        if (!status) {
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

export default useRequestCharData;
