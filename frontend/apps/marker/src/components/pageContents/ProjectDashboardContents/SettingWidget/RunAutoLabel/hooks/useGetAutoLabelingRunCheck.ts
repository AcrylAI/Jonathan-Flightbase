import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type ReqModel = {
  projectId: number;
};
const useGetAutoLabelingRunCheck = (params: ReqModel) => {
  return useQuery(
    [
      '@/src/organisms/Modal/ProjectDashboardContents/SettingWidget/useGetAutoLabelingRunCheck',
      params.projectId,
    ],
    fetcher.query({
      url: '/autolabel/autolabeling_run_check',
      method: METHOD.GET,
      params: { projectId: params.projectId },
    }),
    {
      refetchInterval: 5000,
    },
  );
};
export default useGetAutoLabelingRunCheck;
