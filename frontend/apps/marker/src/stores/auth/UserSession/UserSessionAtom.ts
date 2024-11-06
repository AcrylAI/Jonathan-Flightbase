import { atom } from 'recoil';

import { isNumber } from '@src/utils/utils';

type UserSessionModel = {
  isAdmin: boolean;
  user: string;
  token: string;
  session: string;
  workspaceId: number;
  workspaceName: string;
};

const initUserSessionAtom = (): UserSessionModel => ({
  isAdmin: window.sessionStorage.getItem('is_admin') === 'true',
  user: window.sessionStorage.getItem('user') ?? '',
  token: window.sessionStorage.getItem('token') ?? '',
  session: window.sessionStorage.getItem('session') ?? '',
  workspaceId: isNumber(Number(window.sessionStorage.getItem('workspace_id')))
    ? Number(window.sessionStorage.getItem('workspace_id'))
    : Infinity,
  workspaceName: window.sessionStorage.getItem('workspace_name') ?? '',
});

const userSessionAtom = atom<UserSessionModel>(
  (() => {
    return {
      key: 'auth/UserSessionAtom',
      default: initUserSessionAtom(),
    };
  })(),
);

export type { UserSessionModel };
export { userSessionAtom };
