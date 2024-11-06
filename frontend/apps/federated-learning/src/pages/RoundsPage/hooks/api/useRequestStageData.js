import { useState } from 'react';
import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

function useRequestStageData({ getStageData }) {
  const [stop, setStop] = useState(false);

  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['rounds/round/latest?round_group_name=default'],
    {
      url: 'rounds/round/latest?round_group_name=default',
    },
    {
      refetchInterval: stop ? false : 1500,
      notifyOnChangeProps: ['error'],
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        getStageData(response);
        if (status === 1) {
          if (result.empty) {
            setStop(true);
          } else {
            setStop(false);
          }
          // 사용할 데이터 타입으로 컴포넌트에 넘겨주기
          // ...
        } else {
          setStop(true);
          message && toast.error(message);
        }
      },
      onError: () => {
        toast.error('Network error');
        setStop(true);
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

export default useRequestStageData;
