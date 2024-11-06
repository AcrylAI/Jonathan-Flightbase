import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface CheckUserNameUniqueRequestModel {
  username: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckUserNameUniqueResponseModel {}

function useCheckUserNameUnique() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/unique_username',
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
export default useCheckUserNameUnique;
