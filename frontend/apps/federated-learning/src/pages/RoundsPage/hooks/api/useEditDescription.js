import useHttpRequestMutation from '@src/hooks/useHttpRequestMutation';

import { toast } from '@src/components/uiContents/Toast';

function useEditDescription() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: 'rounds/round/description',
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    {
      onError: () => {
        toast.error('Network error');
      },
    },
  );

  return { onMutateAsync };
}

export default useEditDescription;
