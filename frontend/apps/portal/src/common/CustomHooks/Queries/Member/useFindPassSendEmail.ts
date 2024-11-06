import { API_POST, CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

// TOKEN 하드코딩 되있음 ( 백엔드도 하드코딩 ) - 현상태 유지
export interface MemberFindPassSendMailRequestModel {
  username: string;
}

function useFindPassSendMail() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/forgot',
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
export default useFindPassSendMail;
