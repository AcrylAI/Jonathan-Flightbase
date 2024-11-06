import useUserSession from '@src/hooks/auth/useUserSession';

function useToken() {
  const {
    userSession: { token },
  } = useUserSession();

  return token;
}

export default useToken;
