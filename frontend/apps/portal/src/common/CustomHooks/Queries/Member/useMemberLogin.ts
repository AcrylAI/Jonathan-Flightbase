import useHttpRequestMutation from '@src/common/CustomHooks/useHttpRequestMutation';

/*
next-auth 사용으로 사용하지않음
*/
function useMemberLogin() {
  const { onMutateAsync } = useHttpRequestMutation(
    {
      url: '/accounts/login',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
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
export default useMemberLogin;
