import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface CheckEmailUniqueRequestModel {
  email: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckEmailUniqueResponseModel {}

function useCheckEmailUnique() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/unique_email',
      method: API_POST,
      headers: CONTENT_TYPE_JSON,
    },
    {
      onError: () => {
        // eslint-disable-next-line no-console
        console.log('Network error');
      },
    },
  );

  return { onMutateAsync };
}
export default useCheckEmailUnique;
