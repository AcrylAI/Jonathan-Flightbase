import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

type requestModel = {
  workspaceId: number;
};
const usePostWorkspaceBookmark = () => {
  return useMutation(
    '@/src/templates/SideNavBar/WorkspaceSelector/usePostWorkspaceBookmark',
    fetcher.mut<requestModel>({
      url: '/workspace/bookmark',
      method: METHOD.POST,
    }),
  );
};

export type { requestModel as uesPostWorkspaceBookmarkReqModel };
export default usePostWorkspaceBookmark;
