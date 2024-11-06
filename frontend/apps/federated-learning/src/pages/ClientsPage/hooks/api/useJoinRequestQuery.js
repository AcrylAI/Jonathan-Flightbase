import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

function useJoinRequestQuery({ confirmIsJoinRequest }) {
  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['clients/join-request-clients'],
    {
      url: 'clients/join-request-clients',
    },
    {
      onSuccess: (response) => {
        const { data } = response;
        if (confirmIsJoinRequest) {
          confirmIsJoinRequest(data.result.length > 0 ? true : false);
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

export default useJoinRequestQuery;
