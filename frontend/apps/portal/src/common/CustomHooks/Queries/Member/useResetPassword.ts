import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface useMemberResetPasswordRequestModel {
  reset_key: string;
  new_password: string;
  username: string;
}

export interface useMemberResetPasswordResponseModel {
  oneTimePassword: string;
}

function useMemberResetPassword() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/reset_forgot',
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
export default useMemberResetPassword;
