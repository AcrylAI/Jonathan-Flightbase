import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, JSON_HEADER, METHOD } from '@src/network/api/api';
import type { HttpResponseType } from '@src/network/api/types';

type GetUserGraphRequestModel = {
  workspaceId: number;
  type: number;
  id: number;
};

type GetUserGraphResponseModel = {
  date: string;
  submittedLabeling: number;
  approvedReview: number;
  issued: number;
};

type Options = {
  getData: (graphData: Array<GetUserGraphResponseModel>) => void;
};

function useGetUserGraph(
  params: GetUserGraphRequestModel,
  { getData }: Options,
) {
  return useQuery(
    [
      '@src/page/MembersPage/hooks/useGetUserGraph',
      params.workspaceId,
      params.type,
      params.id,
    ],
    fetcher.query({
      url: '/user/user_graph',
      method: METHOD.GET,
      headers: {
        ...JSON_HEADER,
      },
      params,
    }),
    {
      onSuccess: (data: HttpResponseType) => {
        const { status, result } = data;
        if (status === 1) {
          getData(result ?? []);
          return;
        }
        toast.api.failed();
      },
    },
  );
}

export type { GetUserGraphResponseModel };
export default useGetUserGraph;
