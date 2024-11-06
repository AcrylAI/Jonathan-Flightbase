import { fetcher, METHOD } from '@src/network/api/api';
import { useQuery } from 'react-query';
type useGetAutoLabelDataRequestModel = {
  projectId: number;
};

const useGetAutoLabelData = (params: useGetAutoLabelDataRequestModel) => {
  return useQuery(
    '@/components/organisms/Modal/AutoLabelingModal/useGetAutoLabelData',
    fetcher.query({
      url: '/autolabel/run',
      method: METHOD.GET,
      params,
    }),
  );
};
export default useGetAutoLabelData;
