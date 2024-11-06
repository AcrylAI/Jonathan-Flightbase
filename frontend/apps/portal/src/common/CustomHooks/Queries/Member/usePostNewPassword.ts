import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface MemberPostNewPasswordRequestModel {
  username: string;
  old_password: string;
  new_password: string;
}
export interface MemberPostNewPasswordResponseModel {
  token: string;
  user_id: string;
}

function usePostNewPassword() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/update_password',
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
export default usePostNewPassword;
