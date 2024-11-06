export const getIsAdmin = () => {
  return window.sessionStorage.getItem('is_admin') === 'true';
};

export const getUser = () => {
  return window.sessionStorage.getItem('user');
};

export const getWorkspaceName = () => {
  return window.sessionStorage.getItem('workspace_name');
};

export const getWorkspaceId = () => {
  return window.sessionStorage.getItem('workspace_id');
};

export const getSessionId = () => {
  return window.sessionStorage.getItem('session');
};

export const getToken = () => {
  return window.sessionStorage.getItem('token');
};
