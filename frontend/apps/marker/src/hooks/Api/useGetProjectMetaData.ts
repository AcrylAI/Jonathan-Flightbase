import { useQuery } from 'react-query';

import { toast } from '@src/components/molecules/Toast';

import { fetcher, JSON_HEADER, METHOD } from '@src/network/api/api';
import type { HttpResponseType } from '@src/network/api/types';

type useGetProjectMetaDataResponseModel = {
  id: number;
  name: string;
  autoSetting: 0 | 1;
  description: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
  mobile: number;
  type: number;
  ownerId: number;
  workflow: number;
  dataId: number;
  autoSync: number;
  lastSyncDate: string;
};

type useGetProjectMetaDataRequestModel = { projectId: number };

type useGetProjectMetaDataOptions = {
  getData: (response: useGetProjectMetaDataResponseModel) => void;
};

const useGetProjectMetaData = (
  params: useGetProjectMetaDataRequestModel,
  options?: useGetProjectMetaDataOptions,
) => {
  return useQuery(
    [
      '@/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData',
      params.projectId,
    ],
    fetcher.query({
      url: '/project/meta',
      method: METHOD.GET,
      headers: {
        ...JSON_HEADER,
      },
      params,
    }),
    {
      enabled: params.projectId !== 0 && !Number.isNaN(params.projectId),
      onSuccess: (data: HttpResponseType) => {
        const { result, status } = data;
        if (status === 1) {
          if (options?.getData) {
            options.getData({
              id: result.id ?? Infinity,
              autoSetting: result.autoSetting ?? 0,
              name: result.name ?? '',
              description: result.description ?? '',
              workspaceId: result.workspaceId ?? Infinity,
              createdAt: result.createdAt ?? '',
              updatedAt: result.updatedAt ?? '',
              mobile: result.mobile ?? Infinity,
              type: result.type ?? Infinity,
              ownerId: result.ownerId ?? Infinity,
              workflow: result.workflow ?? Infinity,
              dataId: result.dataId ?? Infinity,
              autoSync: result.autoSync ?? Infinity,
              lastSyncDate: result.lastSyncDate ?? '',
            });
          }
        } else {
          toast.api.failed();
        }
      },
    },
  );
};

export type { useGetProjectMetaDataResponseModel };
export default useGetProjectMetaData;
