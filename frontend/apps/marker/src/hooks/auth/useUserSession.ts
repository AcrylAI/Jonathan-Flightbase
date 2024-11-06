import { useRef } from 'react';
import { useRecoilState } from 'recoil';

// import _ from 'lodash';
// import { UserSessionAtom } from '@src/stores/auth/UserSession';
import { ForceReRenderAtom } from '@src/stores/utils/ForceReRenderAtom';

import { isNumber } from '@src/utils/utils';

type UserSessionType = {
  isAdmin: boolean;
  user: string;
  token: string;
  session: string;
  workspaceId: number;
  workspaceName: string;
};

function isUserInfoKey(
  key: string,
): key is 'user' | 'token' | 'session' | 'workspaceId' | 'workspaceName' {
  if (
    key === 'user' ||
    key === 'token' ||
    key === 'session' ||
    key === 'workspaceId' ||
    key === 'workspaceName'
  ) {
    return true;
  }
  return false;
}

const initUserInfoAtom = (): UserSessionType => ({
  isAdmin: window.sessionStorage.getItem('is_admin') === 'true',
  user: window.sessionStorage.getItem('user') ?? '',
  token: window.sessionStorage.getItem('token') ?? '',
  session: window.sessionStorage.getItem('session') ?? '',
  workspaceId: isNumber(Number(window.sessionStorage.getItem('workspace_id')))
    ? Number(window.sessionStorage.getItem('workspace_id'))
    : Infinity,
  workspaceName: window.sessionStorage.getItem('workspace_name') ?? '',
});

type UserSessionOptions = {
  reRender: boolean;
};

function useUserSession() {
  const [forceReRenderAtom, setForceReRenderAtom] = useRecoilState<boolean>(
    ForceReRenderAtom.forceReRenderAtom,
  );

  const session = useRef<UserSessionType>(initUserInfoAtom());

  const updateUserSessionStorage = (userSession: UserSessionType) => {
    const { isAdmin, user, token, session, workspaceId, workspaceName } =
      userSession;

    window.sessionStorage.setItem('is_admin', String(isAdmin));
    window.sessionStorage.setItem('user', user);
    window.sessionStorage.setItem('token', token);
    window.sessionStorage.setItem('session', session);
    window.sessionStorage.setItem('workspace_id', String(workspaceId));
    window.sessionStorage.setItem('workspace_name', workspaceName);
  };

  const updateUserSession = (
    userSession: UserSessionType,
    { reRender = true }: Partial<UserSessionOptions>,
  ) => {
    session.current = userSession;

    updateUserSessionStorage(session.current);
    if (reRender) {
      setForceReRenderAtom(!forceReRenderAtom);
    }

    return session.current;
  };

  const removeUserSession = ({
    reRender = true,
  }: Partial<UserSessionOptions>) => {
    window.sessionStorage.setItem('is_admin', '');
    window.sessionStorage.setItem('user', '');
    window.sessionStorage.setItem('token', '');
    window.sessionStorage.setItem('session', '');
    window.sessionStorage.setItem('workspace_id', '');
    window.sessionStorage.setItem('workspace_name', '');

    session.current = {
      isAdmin: false,
      user: '',
      token: '',
      session: '',
      workspaceId: Infinity,
      workspaceName: '',
    };

    if (reRender) {
      setForceReRenderAtom(!forceReRenderAtom);
    }

    return session.current;
  };

  return {
    updateUserSession,
    removeUserSession,
    userSession: initUserInfoAtom(),
  };
}

export type { UserSessionType };
export { isUserInfoKey };
export default useUserSession;
