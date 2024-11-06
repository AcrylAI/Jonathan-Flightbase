import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface MemberRegisterRequestModel {
  username: string;
  email: string;
  name: string;
  company: string;
  position: string;
  route: string;
  purpose: string;
  factor: string;
}

function useMemberJoinRequest() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/join-request',
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
export default useMemberJoinRequest;
