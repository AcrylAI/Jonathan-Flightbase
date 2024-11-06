import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
type ReqModel = {
  projectId: number;
  workspaceId: number;
};
const useGetSetAutoLabelData = (params: ReqModel) => {
  return useQuery(
    [
      '@/src/components/organisms/modal/AutoLabelingModal/useGetSetAutoLabelData',
      params.projectId,
      params.workspaceId,
    ],
    fetcher.query({
      url: '/autolabel/set',
      method: METHOD.GET,
      params,
    }),
  );
};
export default useGetSetAutoLabelData;
