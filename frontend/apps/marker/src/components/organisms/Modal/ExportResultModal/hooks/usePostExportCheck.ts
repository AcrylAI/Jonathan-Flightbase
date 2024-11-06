import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

type ReqModel = {
  fileName: string;
  dataset: string;
};
const usePostExportCheck = () => {
  return useMutation(
    ['@/src/components/organisms/Modal/ExportResultModal/useGetExportCheck'],
    fetcher.mut<ReqModel>({
      url: '/export/check',
      method: METHOD.POST,
    }),
  );
};

export type { ReqModel as usePostExportCheckReqModel };
export default usePostExportCheck;
