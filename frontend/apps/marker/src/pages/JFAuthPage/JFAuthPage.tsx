import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { toast } from '@src/components/molecules/Toast';

import type { UserSessionType } from '@src/hooks/auth/useUserSession';
import useUserSession from '@src/hooks/auth/useUserSession';
import { isUserInfoKey } from '@src/hooks/auth/useUserSession';

import JFAuth from './JFAuth';

import { fetcher } from '@src/network/api/api';
import Cookies from 'universal-cookie';

function JFAuthPage() {
  const cookies = new Cookies();
  const { search } = useLocation();
  const params = useMemo(() => search.substring(1).split('&'), [search]);

  const { userSession, updateUserSession } = useUserSession();

  const [loginStatus, setLoginStatus] = useState({
    isSuccess: false,
    isFailed: false,
  });

  const mountRef = useRef(false);

  const reqLogin = async (newUserInfo: UserSessionType) => {
    const { session, token, user, workspaceId } = newUserInfo;

    const accessToken = cookies.get('access_token');

    if (
      session === '' ||
      token === '' ||
      user === '' ||
      Number.isNaN(workspaceId)
    ) {
      toast.error('유저 정보를 받아오지 못했습니다');
      return;
    }

    const headers: { [key: string]: string | number } = {
      'jf-session': session,
      'jf-token': token,
      'jf-user': user,
      'jf-workspace-id': workspaceId,
    };

    if (accessToken) {
      headers.authorization = accessToken;
    }

    const response = await fetcher.mut({
      url: '/user/login_jf',
      headers,
      method: 'POST',
    })({});

    if (
      response.status === 1 &&
      typeof response?.result?.workspaceId === 'number'
    ) {
      setLoginStatus((status) => ({
        ...status,
        isSuccess: true,
      }));

      const { workspaceName, session, token } = newUserInfo;

      const newUserSession: UserSessionType = {
        isAdmin: true,
        workspaceName,
        workspaceId: Number(response.result.workspaceId),
        session,
        token,
        user,
      };

      updateUserSession(newUserSession, {});
    } else {
      toast.error(response.message);
      setLoginStatus((status) => ({
        ...status,
        isFailed: true,
      }));
    }
  };

  useLayoutEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      const newUserInfo: UserSessionType = {
        ...userSession,
        isAdmin: true,
      };

      for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const co = param.indexOf('=');
        const { key, value } = {
          key: param.substring(0, co),
          value: param.substring(co + 1, param.length),
        };

        if (isUserInfoKey(key)) {
          if (key === 'workspaceId') {
            const v: number = Number(value);
            if (!Number.isNaN(v)) {
              newUserInfo[key] = v;
            }
          } else if (key === 'workspaceName') {
            newUserInfo[key] = value;
          } else {
            newUserInfo[key] = value;
          }
        }
      }

      reqLogin(newUserInfo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountRef, params]);

  return <JFAuth loginStatus={loginStatus} />;
}

export default JFAuthPage;
