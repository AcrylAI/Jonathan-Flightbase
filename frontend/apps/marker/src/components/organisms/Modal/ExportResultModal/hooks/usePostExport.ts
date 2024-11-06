import { useMutation } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
type ReqModel = {
  projectId: number;
  form: 0 | 1; // 0 JSON 1 CSV
  method: 0 | 1; // 0 send folder 1 immediately
  fileName: string;
  force: 0 | 1; // 0 | undefined no 1 overwrite
  // tool?: number;
};

type QueryReqModel = {
  classCount: number | null;
};

const usePostExport = ({ classCount }: QueryReqModel) => {
  return useMutation(
    ['@/src/components/organisms/Modal/ExportResultModal/uesPostExport'],
    fetcher.mut<ReqModel>({
      url: '/export',
      method: METHOD.POST,
      params: { classCount },
    }),
  );
};

export type { ReqModel as usePostExportReqModel };
export default usePostExport;
