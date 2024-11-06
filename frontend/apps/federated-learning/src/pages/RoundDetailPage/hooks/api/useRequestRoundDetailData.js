import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

/**
 * 라운드 상세페이지
 * @param {string} id
 * @param {({
 *    clientTraining: Object,
 *    aggregation: Object,
 *    resultModel: Object,
 *  }) => void
 * } setDatas
 */
function useRequestRoundDetailData({ id, setDatas }) {
  useHttpRequestQuery(
    [`rounds/round/detail?round_group_name=default&round_name=${id}`],
    {
      url: `rounds/round/detail?round_group_name=default&round_name=${id}`,
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;

        if (!status) {
          toast.error(message);
        }

        setDatas({
          clientTraining: result?.client_training,
          aggregation: result?.aggregation,
          resultModel: result?.result_model,
        });
      },
      onError: () => {
        toast.error('Network error');
      },
    },
  );
}

export default useRequestRoundDetailData;
