import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

function useRequestMetricOptions({ getMetricOption, metricDataHandler }) {
  useHttpRequestQuery(
    [`options/dashboard`],
    {
      url: `options/dashboard`,
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        if (status === 1) {
          const { key_metrics: metricsKey, metrics_item_list: optionList } =
            result;
          getMetricOption(metricsKey, optionList);
        } else {
          metricDataHandler([]);
          toast.error(message);
        }
      },
      onError: () => {
        metricDataHandler([]);
        toast.error('Network error');
      },
    },
  );
}

export default useRequestMetricOptions;
