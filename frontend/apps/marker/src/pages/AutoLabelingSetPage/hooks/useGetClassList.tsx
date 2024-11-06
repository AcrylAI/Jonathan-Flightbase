import { useQuery } from 'react-query';

import { fetcher, METHOD } from '@src/network/api/api';

const key = ['@src/pages/AutoLabelingSetPage/hooks/useGetClassList'];

type useGetClassListRequestModel = {
  projectId: number;
};

function useGetClassList(params: useGetClassListRequestModel) {
  const response = useQuery(
    key,
    fetcher.query({
      method: METHOD.GET,
      url: `/autolabel/set_class_list`,
      params,
    }),
  );
  return response;
}
export default useGetClassList;
