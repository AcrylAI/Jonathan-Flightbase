import { useLocation, useParams } from 'react-router-dom';

import {
  getIsAdmin,
  getSessionId,
  getToken,
  getUser,
  getWorkspaceId,
  getWorkspaceName,
} from '@tools/utils';

function useProjectData() {
  const params = useParams();
  const { state, pathname } = useLocation();

  const isAdmin = getIsAdmin();
  const userName = getUser() ?? '';
  const workspaceName = getWorkspaceName() ?? '';
  const workspaceId = getWorkspaceId() ?? '';
  const sessionId = getSessionId() ?? '';
  const token = getToken() ?? '';

  return {
    jobId: params?.jid ? Number(params.jid) : 0,
    projectId: state?.projectId ? Number(state.projectId) : 0,
    workType: state?.workType ? Number(state?.workType) : 0,
    isAdmin,
    userName,
    workspaceName,
    workspaceId,
    sessionId,
    token,
    isView: pathname.includes('view'),
    pathname,
  };
}

export default useProjectData;
