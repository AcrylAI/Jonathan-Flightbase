import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

export interface MemberLogoutRequestModel {
  user_id: string;
}

function useMemberLogout() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/logout',
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

export default useMemberLogout;
