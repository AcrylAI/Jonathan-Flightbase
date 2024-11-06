import { fetcher, JSON_HEADER, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type useGetProjectMetaDataRequestModel = { projectId: number };
type useGetProjectMetaDataResponseModel = {
  id: number;
  name: string;
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

export const useGetProjectMetaData = (
  params: useGetProjectMetaDataRequestModel,
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
  );
};
