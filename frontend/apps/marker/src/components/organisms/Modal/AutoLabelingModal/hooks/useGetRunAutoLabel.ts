import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type ReqModel = {
  projectId: number;
  workspaceId: number;
};

const useGetRunAutoLabel = (params: ReqModel) => {
  return useQuery(
    [
      params.projectId,
      '@/components/organisms/Modal/AutoLabelingModal/useGetAutoLabelData',
    ],
    fetcher.query({
      url: '/autolabel/run',
      method: METHOD.GET,
      params,
    }),
  );
};
export default useGetRunAutoLabel;
