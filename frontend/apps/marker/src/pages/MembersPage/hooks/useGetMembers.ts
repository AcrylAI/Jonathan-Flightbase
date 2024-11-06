import { useMutation, useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

export type useGetMemberParams = {
  workspaceId?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  memberType?: string;
  search?: string;
};

export const useGetMembers = (params: useGetMemberParams) => {
  return useQuery(
    ['@/pages/MemberPage/hooks/useGetMembers', params.workspaceId],
    fetcher.query({
      url: '/user/workspace_user_list',
      method: METHOD.GET,
      params,
    }),
  );
};

export const useActive = (token: string) => {
  return useMutation(
    ['@/pages/MemberPage/hooks/useActive'],
    fetcher.mut({
      url: '/user/workspace_user_list',
      method: METHOD.POST,
      headers: { token },
    }),
  );
};
