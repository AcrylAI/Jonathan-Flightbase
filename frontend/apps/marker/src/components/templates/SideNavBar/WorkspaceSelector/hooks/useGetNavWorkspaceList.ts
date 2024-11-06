import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';

const useGetNavWorkspaceList = () => {
  return useQuery(
    '@/src/templates/SideNavBar/WorkspaceSelector/useGetNavWorkspaceList',
    fetcher.query({
      url: '/workspace/navlist',
      method: METHOD.GET,
    }),
  );
};

export default useGetNavWorkspaceList;
