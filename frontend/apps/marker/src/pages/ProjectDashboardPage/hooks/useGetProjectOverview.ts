import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, METHOD } from '@src/network/api/api';
import type { HttpResponseType } from '@src/network/api/types';

type ProjectDashboardResponseModel = {
  dataInfo: {
    autoLabeling: number;
    complete: number;
    labeling: number;
    notWork: number;
    review: number;
    total: number;
    percent: {
      autoLabeling: number;
      complete: number;
      labeling: number;
      notWork: number;
      review: number;
    };
  };
  dataset: {
    dataCnt: number;
    folderName: string;
    folderPath: string;
    name: string;
  };
  member: {
    labeling: number;
    review: number;
    total: number;
  };
  title: string;
  updatedDate: string;
  class: Array<{
    color: string;
    name: string;
    tool: number;
  }>;
  workInfo: {
    message: string;
  };
  workResult: Array<{
    className: string;
    value: number;
    deleted: 0 | 1;
    color: string;
    xText: string;
  }>;
};

type UseGetProjectOverviewRequestModel = {
  projectId: number;
};

type Options = {
  getData: (response: ProjectDashboardResponseModel) => void;
};

function useGetProjectOverview(
  { projectId }: UseGetProjectOverviewRequestModel,
  { getData }: Options,
) {
  return useQuery(
    ['@src/pages/ProjectDashboardPage/hooks/useGetProjectOverview'],
    fetcher.query({
      url: '/project/overview',
      method: METHOD.GET,
      params: {
        type: 'project',
        id: projectId,
      },
    }),
    {
      enabled: !Number.isNaN(projectId),
      onSuccess: (response: HttpResponseType) => {
        const { status, result } = response;
        if (status === 1) {
          const res: Partial<ProjectDashboardResponseModel> = result;
          const getPercent = (criterion: number, obj: number): number => {
            if (criterion === 0) return 0;

            return (obj / criterion) * 100;
          };

          const dataInfo = {
            autoLabeling: res?.dataInfo?.autoLabeling ?? 0,
            complete: res?.dataInfo?.complete ?? 0,
            notWork: res?.dataInfo?.notWork ?? 0,
            labeling: res?.dataInfo?.labeling ?? 0,
            review: res?.dataInfo?.review ?? 0,
            total: res?.dataInfo?.total ?? 0,
          };

          const percent = {
            autoLabeling: Math.floor(
              getPercent(dataInfo.total, dataInfo.autoLabeling),
            ),
            notWork: Math.floor(getPercent(dataInfo.total, dataInfo.notWork)),
            labeling: Math.floor(getPercent(dataInfo.total, dataInfo.labeling)),
            review: Math.floor(getPercent(dataInfo.total, dataInfo.review)),
            complete: Math.floor(getPercent(dataInfo.total, dataInfo.complete)),
          };

          getData({
            dataInfo: {
              ...dataInfo,
              percent,
            },
            dataset: {
              dataCnt: res?.dataset?.dataCnt ?? 0,
              folderName: res?.dataset?.folderName ?? '',
              folderPath: res?.dataset?.folderPath ?? '',
              name: res?.dataset?.name ?? '',
            },
            member: {
              labeling: res?.member?.labeling ?? 0,
              review: res?.member?.review ?? 0,
              total: res?.member?.total ?? 0,
            },
            class: Array.isArray(res?.class) ? res?.class : [],
            title: res?.title ?? '',
            updatedDate: res?.updatedDate ?? '',
            workInfo: {
              message: res?.workInfo?.message ?? '',
            },
            workResult: Array.isArray(res?.workResult) ? res?.workResult : [],
          });
          return;
        }
        toast.api.failed();
      },
    },
  );
}

export type { ProjectDashboardResponseModel };
export default useGetProjectOverview;
