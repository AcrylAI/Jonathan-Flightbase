import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';

type useGetProjectClassesRequestModel = {
  projectId: number;
};

export const useGetProjectClasses = (
  params: useGetProjectClassesRequestModel,
) => {
  return useQuery(
    '@components/pageContents/useGetProjectClasses',
    fetcher.query({
      url: `/classes/${params.projectId}`,
      method: METHOD.GET,
    }),
  );
};
