import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

function useRequestDashboardData({ dashboardDataHandler }) {
  useHttpRequestQuery(
    ['dashboard'], // query key -> string or object
    {
      url: 'dashboard', // network에 들어갈 요청옵션 // useQuery에서는 promise 반환 함수를 넣어야함
    },
    {
      //reactQueryOption
      onSuccess: (response) => {
        const {
          data: { result, status, message },
        } = response;
        if (status === 1) {
          let {
            project_model: modelData,
            latest_rounds: latestRoundsData,
            project_network: networkData,
            client: clientData,
          } = result;
          let modelDescData = {
            title: modelData?.model_name ? modelData?.model_name : '',
            desc: modelData?.model_description,
          };

          if (!latestRoundsData) {
            latestRoundsData = [];
          }
          let roundsBucket = [];
          dashboardDataHandler({
            model: modelDescData,
            rounds: roundsBucket.concat(...latestRoundsData),
            network: networkData,
            client: clientData,
          });
        } else {
          dashboardDataHandler({
            model: null,
            rounds: [],
            network: null,
            client: [],
          });
          toast.error(message);
        }
      },
      onError: (err) => {
        dashboardDataHandler({
          model: null,
          rounds: [],
          network: null,
          client: [],
        });
        toast.error('Network error');
      },
    },
  );
}

export default useRequestDashboardData;
