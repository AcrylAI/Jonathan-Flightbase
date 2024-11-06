import { useMutation } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';
interface request {
  autolabelId: number;
  deployment: string;
  projectId: number;
}

const usePostStopAutolabeling = () => {
  return useMutation(
    '@src/components/organsism/Modal/StopAutoLabellingModal/usePostStopAutolabeling',
    fetcher.mut<request>({
      url: '/autolabel/stop',
      method: METHOD.POST,
    }),
  );
};
export type { request as usePostStopAutolabelingReqModel };
export default usePostStopAutolabeling;
