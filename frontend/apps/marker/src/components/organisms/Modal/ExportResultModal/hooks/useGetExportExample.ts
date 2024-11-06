import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
type reqModel = {
  projectId: number;
  form: 0 | 1; // 0:json 1:csv
  // tool: number;
  classCount?: number | null;
};
type resModel = { data: string; type: 'json' | 'csv' };

const useGetExportExample = ({ projectId, form, classCount }: reqModel) => {
  return useQuery(
    [
      '@/src/components/organisms/Modal/ExportResultModal/useGetExportExample',
      form,
    ],
    fetcher.query({
      url: '/export/example',
      method: METHOD.GET,
      params: { projectId, form, classCount },
    }),
    {
      enabled: !!projectId,
    },
  );
};
export type { resModel as useGetExportExampleResModel };
export default useGetExportExample;
