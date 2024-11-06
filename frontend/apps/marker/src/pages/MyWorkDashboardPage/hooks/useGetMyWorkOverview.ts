import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, METHOD } from '@src/network/api/api';
import type { HttpResponseType } from '@src/network/api/types';

type LabelingInfoType = {
  count: number;
  new: number;
};

type MyWorkDashboardResponseModel = {
  guide: Array<{
    id: number;
    name: string;
    url: string;
    createdDate: string;
  }>;
  labelingInfo: {
    complete: LabelingInfoType;
    labeling: LabelingInfoType;
    reject: LabelingInfoType;
    review: LabelingInfoType;
  };
  labelingRatio: {
    labeling: number;
    reject: number;
  };
  projectInfo: {
    annotation: Array<string>;
    createdDate: string;
    description: string;
    mobile: number;
    owner: string;
    title: string;
    type: string;
    workflow: number;
  };
  reviewRatio: {
    review: number;
    reject: number;
  };
  reviewInfo: {
    complete: LabelingInfoType;
    relabeling: LabelingInfoType;
    review: LabelingInfoType;
  };
  title: string;
};

type UseGetProjectOverviewRequestModel = {
  projectId: number;
};

type Options = {
  getData: (response: MyWorkDashboardResponseModel) => void;
};

function useGetMyWorkOverview(
  { projectId }: UseGetProjectOverviewRequestModel,
  { getData }: Options,
) {
  return useQuery(
    ['@src/pages/MyWorkDashboardPage/hooks/useGetMyWorkOverview'],
    fetcher.query({
      url: '/project/overview',
      method: METHOD.GET,
      params: {
        type: 'my',
        id: projectId,
      },
    }),
    {
      enabled: !Number.isNaN(projectId),
      onSuccess: (response: HttpResponseType) => {
        const { status, result, message } = response;
        if (status === 1) {
          const res = result as Partial<MyWorkDashboardResponseModel>;

          getData({
            guide: Array.isArray(res?.guide) ? res.guide : [],
            labelingInfo: {
              complete: {
                count: res?.labelingInfo?.complete?.count ?? 0,
                new: res?.labelingInfo?.complete?.new ?? 0,
              },
              labeling: {
                count: res?.labelingInfo?.labeling?.count ?? 0,
                new: res?.labelingInfo?.labeling?.new ?? 0,
              },
              reject: {
                count: res?.labelingInfo?.reject?.count ?? 0,
                new: res?.labelingInfo?.reject?.new ?? 0,
              },
              review: {
                count: res?.labelingInfo?.review?.count ?? 0,
                new: res?.labelingInfo?.review?.new ?? 0,
              },
            },
            labelingRatio: {
              labeling: res?.labelingRatio?.labeling ?? 0,
              reject: res?.labelingRatio?.reject ?? 0,
            },
            projectInfo: {
              annotation: Array.isArray(res?.projectInfo?.annotation)
                ? (res.projectInfo?.annotation as Array<string>)
                : [],
              createdDate: res?.projectInfo?.createdDate ?? '',
              description: res?.projectInfo?.description ?? '',
              mobile: res?.projectInfo?.mobile ?? '',
              owner: res?.projectInfo?.owner ?? '',
              title: res?.projectInfo?.title ?? '',
              type: res?.projectInfo?.type ?? '',
              workflow: res?.projectInfo?.workflow ?? '',
            },
            reviewRatio: {
              reject: res?.reviewRatio?.reject ?? 0,
              review: res?.reviewRatio?.review ?? 0,
            },
            reviewInfo: {
              complete: {
                count: res?.reviewInfo?.complete?.count ?? 0,
                new: res?.reviewInfo?.complete?.new ?? 0,
              },
              relabeling: {
                count: res?.reviewInfo?.relabeling?.count ?? 0,
                new: res?.reviewInfo?.relabeling?.new ?? 0,
              },
              review: {
                count: res?.reviewInfo?.review?.count ?? 0,
                new: res?.reviewInfo?.review?.new ?? 0,
              },
            },

            title: res?.title ?? '',
          });
          return;
        }
        toast.error(message);
      },
    },
  );
}

export type { MyWorkDashboardResponseModel };
export default useGetMyWorkOverview;
