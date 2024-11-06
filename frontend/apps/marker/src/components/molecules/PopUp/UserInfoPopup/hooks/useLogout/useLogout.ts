import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { toast } from '@src/components/molecules/Toast';

import { NONE_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';

// network
import { fetcher, METHOD } from '@src/network/api/api';

function useLogout() {
  const navigate = useNavigate();
  const {
    userSession: { token, user: name, session },
    removeUserSession,
  } = useUserSession();

  const logoutMutation = useMutation(
    fetcher.mut({
      method: METHOD.POST,
      url: '/user/logout',
      headers: {
        token,
        name,
        session,
      },
    }),
  );

  const logout = async () => {
    const result = await logoutMutation.mutateAsync({});
    if (result.status === 1) {
      removeUserSession({
        reRender: false,
      });

      navigate(NONE_URL.LOGIN_PAGE);
    } else {
      toast.error(result.message);
    }
  };

  return { logout };
}

export default useLogout;
