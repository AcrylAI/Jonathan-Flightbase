import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
interface requestModel {
  workspaceId: number;
}
const useDeleteWorkspaceBookmark = () => {
  return useMutation(
    ['@/src/templates/SideNavBar/useDeleteWorkspaceBookmark'],
    fetcher.mut<requestModel>({
      url: '/workspace/bookmark',
      method: METHOD.DELETE,
    }),
  );
};

export default useDeleteWorkspaceBookmark;
