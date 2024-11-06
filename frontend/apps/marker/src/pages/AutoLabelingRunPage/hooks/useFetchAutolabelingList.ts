import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, METHOD } from '@src/network/api/api';
import { HttpResponseType } from '@src/network/api/types';

type AutoLabelingRunResModel = {
  dataCnt: number;
  // deleted: number;
  deploy: string;
  finished: string;
  id: number;
  model: Array<{
    modelName: string;
    deploy: string;
  }>;
  started: string;
  status: number;
  creator: string;
  total: number;
  work: number;
  count: number;
};

type AutolabelingRunListRequestModel = {
  projectId: number;
};

type AutolabelingRunListOptions = {
  getAutolabingRunList: (list: Array<AutoLabelingRunResModel>) => void;
};

function useFetchAutolabelingList(
  { projectId }: AutolabelingRunListRequestModel,
  { getAutolabingRunList }: AutolabelingRunListOptions,
) {
  return useQuery(
    ['autolabeler'],
    fetcher.query({
      url: '/autolabel/list',
      method: METHOD.GET,
      params: {
        projectId,
      },
    }),
    {
      refetchInterval: 5000,
      enabled: !Number.isNaN(projectId),
      onSuccess: (data: HttpResponseType) => {
        const { status, result } = data;
        if (status === 1) {
          getAutolabingRunList(Array.isArray(result) ? result : []);
          return;
        }
        toast.api.failed();
      },
    },
  );
}

export type { AutoLabelingRunResModel };
export default useFetchAutolabelingList;
