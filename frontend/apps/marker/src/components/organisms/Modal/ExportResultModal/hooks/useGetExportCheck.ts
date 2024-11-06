import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';

type ReqModel = {
  projectId: number;
};
const useGetExportCheck = (params: ReqModel) => {
  return useQuery(
    [
      '@/src/components/organisms/Modal/ExportResultModal/useGetExportCheck',
      params.projectId,
    ],
    fetcher.query({
      url: '/export/check',
      method: METHOD.GET,
      params,
    }),
  );
};

export type { ReqModel as useGetExportCheckReqModel };
export default useGetExportCheck;
