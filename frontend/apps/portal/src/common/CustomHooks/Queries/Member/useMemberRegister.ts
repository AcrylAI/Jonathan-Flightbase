import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface MemberRegisterRequestModel {
  name?: string;
  email: string;
  pwd_org: string;
  username: string;
  security_code?: string;
}
export interface MemberRegisterResponseModel {
  token: string;
  user_id: string;
}

function useMemberRegister() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/register',
      method: API_POST,
      headers: CONTENT_TYPE_JSON,
    },
    {
      onError: (error: string) => {
        // eslint-disable-next-line no-console
        console.log(error);
      },
    },
  );

  return { onMutateAsync };
}
export default useMemberRegister;
