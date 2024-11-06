import { useQuery } from 'react-query';

// Components
import { toast } from '@src/components/molecules/Toast';

// network
import { fetcher, METHOD } from '@src/network/api/api';
import type { HttpResponseType } from '@src/network/api/types';

type UseFetchAutolabelingGraphResModel = {
  totalData: number;
  data: Array<{
    className: string;
    data: number;
    color: string;
  }>;
};

type UseFetchAutolabelingGraphReqModel = {
  autolabelId: number;
};

type UseFetchAutolabelingGraphOption = {
  getData: (
    response: UseFetchAutolabelingGraphResModel,
    autolabelId: number,
  ) => void;
};

function useFetchAutolabelingGraph(
  params: UseFetchAutolabelingGraphReqModel,
  { getData }: UseFetchAutolabelingGraphOption,
) {
  const enabled = params.autolabelId !== Infinity;

  return useQuery(
    [
      '@src/pages/AutolabelingRunPage/hooks/useFetchAuthlabelingGraph',
      params.autolabelId,
    ],
    fetcher.query({
      method: METHOD.GET,
      url: '/autolabel/graph',
      params,
    }),
    {
      enabled,
      onSuccess: (response: HttpResponseType) => {
        const { status, result } = response;

        if (status === 1) {
          getData(
            {
              totalData: result?.totalData ?? 0,
              data: result?.data ?? [],
            },
            params.autolabelId,
          );
          return;
        }
        toast.api.failed();
      },
    },
  );
}

export type { UseFetchAutolabelingGraphResModel };
export default useFetchAutolabelingGraph;
