import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, METHOD } from '@src/network/api/api';
import { HttpResponseType } from '@src/network/api/types';

type UseFetchDashboardGraphRequestModel = {
  projectId: number;
};

type UseFetchDashboardGraphResponseModel = {
  doubleDonut: {
    approvedLabeling: number;
    submittedLabeling: number;
    workInProgress: number;
  };
  doubleLine: Array<{
    approvedLabeling: number;
    date: string;
    submittedLabeling: number;
  }>;
};

type UseFetchDashboardGraphOptions = {
  getData: (response: UseFetchDashboardGraphResponseModel) => void;
};

function useFetchDashboardGraph(
  { projectId }: UseFetchDashboardGraphRequestModel,
  { getData }: UseFetchDashboardGraphOptions,
) {
  return useQuery(
    ['@src/pages/ProjectDashboardPage/hooks/useFetchDashboardGraph'],
    fetcher.query({
      url: '/project/graph',
      method: METHOD.GET,
      params: {
        projectId,
      },
    }),
    {
      enabled: !Number.isNaN(projectId),
      onSuccess: (response: HttpResponseType) => {
        const { status, result } = response;
        if (status === 1) {
          const res: UseFetchDashboardGraphResponseModel = {
            doubleDonut: {
              approvedLabeling: result?.doubleDonut?.approvedLabeling ?? 0,
              submittedLabeling: result?.doubleDonut?.submittedLabeling ?? 0,
              workInProgress: result?.doubleDonut?.workInProgress ?? 0,
            },
            doubleLine: result?.doubleLine ?? [],
          };
          getData(res);
          return;
        }

        toast.api.failed();
      },
    },
  );
}

export type {
  UseFetchDashboardGraphRequestModel,
  UseFetchDashboardGraphResponseModel,
  UseFetchDashboardGraphOptions,
};
export default useFetchDashboardGraph;
