import { useMutation } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import type { UserSessionType } from '@src/hooks/auth/useUserSession';
import useUserSession from '@src/hooks/auth/useUserSession';

// fetcher
import { fetcher, METHOD } from '@src/network/api/api';

// model
type LoginType = {
  name: string;
  password: string;
  force: 'Y' | 'N';
};

function useLogin() {
  const { updateUserSession } = useUserSession();

  const loginMutation = useMutation(
    ['@src/pages/LoginPage/hooks/useLogin'],
    fetcher.mut<LoginType>({
      method: METHOD.POST,
      url: '/user/login',
    }),
  );

  const login = async ({
    name,
    password,
    force,
  }: LoginType): Promise<0 | 1 | 2> => {
    const body = {
      name,
      password,
      force,
    };

    const response = await loginMutation.mutateAsync(body);
    const { httpStatus, status, message, result, code } = response;

    if (httpStatus === 200) {
      // session에 사용자 정보 입력
      if (status === 1 && result.token) {
        const { token, workspaceId } = result;

        const newUserSession: UserSessionType = {
          user: name,
          token,
          isAdmin: false,
          workspaceName: '',
          workspaceId,
          session: '',
        };

        updateUserSession(newUserSession, {});

        // login 성공
        return 1;
      }

      if (code === 'ME.01.08') {
        // already login
        return 2;
      }

      if (status === 0) {
        toast.error(message);
        // login 실패
        return 0;
      }
    }

    toast.api.failed();

    // login 실패
    return 0;
  };

  return { login };
}

export default useLogin;
