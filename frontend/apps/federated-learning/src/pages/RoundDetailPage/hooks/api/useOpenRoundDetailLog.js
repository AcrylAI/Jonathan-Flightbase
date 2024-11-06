import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

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
function useOpenRoundDetailLog({ setLogDataHandler }) {
  const { onMutate } = useHttpRequestMutation(
    {
      method: 'get',
      url: 'rounds/aggregation/hps-item-log',
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        // console.log(result.join(''));

        if (!status) {
          toast.error(message);
        }

        setLogDataHandler(result.join(''));
      },
      onError: () => {
        toast.error('Network error');
      },
    },
  );

  return {
    onMutate,
  };
}

export default useOpenRoundDetailLog;
