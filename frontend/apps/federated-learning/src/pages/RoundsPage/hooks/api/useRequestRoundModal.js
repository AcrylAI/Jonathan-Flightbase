import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

function useRequestRoundModal() {
  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['options/round-create'],
    {
      url: 'options/round-create',
    },
    {
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        if (status === 1) {
          console.log(result);
          // 사용할 데이터 타입으로 컴포넌트에 넘겨주기
          // ...
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

export default useRequestRoundModal;
