import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';
import { toast } from '@src/components/uiContents/Toast';

function useOpenRoundModal({ dashboardRoute, onOpenRoundModal }) {
  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['options/round-create'],
    {
      url: 'options/round-create',
    },
    {
      enabled: dashboardRoute || false,
      onSuccess: (response) => {
        onOpenRoundModal(response);
      },
      onError: () => {
        toast.error('Network error');
      },
    },
  );
  // console.log('data-', data);
  return {
    data,
    error,
    isLoading,
    onRefetch,
  };
}
export default useOpenRoundModal;
