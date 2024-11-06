import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery, useMutation } from 'react-query';

export type useGetModelParams = {
  workspaceId?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
};

type getModels = {
  params: useGetModelParams;
  token: string;
  session: string;
};

export type syncParams = {
  workspaceId?: number;
};
export const useGetModels = ({ params, token, session }: getModels) => {
  return useQuery(
    ['@/pages/ModelsPage/hooks/useGetModels', params.workspaceId],
    fetcher.query({
      url: 'models/list',
      method: METHOD.GET,
      params,
      headers: {
        token,
        session,
      },
    }),
  );
};

export const useModelActive = (token: string, session: string) => {
  return useMutation(
    ['@/pages/ModelsPage/hooks/useModelActive'],
    fetcher.mut({
      url: '/models/visible',
      method: METHOD.POST,
      headers: {
        token,
        session,
      },
    }),
  );
};

export const useSync = (params: syncParams, token: string, session: string) => {
  return useQuery(
    ['@/pages/modelsPage/hooks/useSync', params.workspaceId],
    fetcher.query({
      url: '/models/sync',
      method: METHOD.GET,
      params,
      headers: {
        token,
        session,
      },
    }),
  );
};
