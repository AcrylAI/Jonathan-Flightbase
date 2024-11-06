import { useState } from 'react';

// Components
import DashboardContent from '@src/components/pageContents/DashboardContents/DashboardContent';

// API hooks
import useRequestMetricData from './hooks/api/useRequestMetricData';
import useRequestMetricOptions from './hooks/api/useRequestMetricOptions';
import useRequestDashboardData from './hooks/api/useRequestDashboardData';

function DashboardPage() {
  const [metricData, setMetricData] = useState(null);
  const [networkData, setNetworkData] = useState({});
  const [clientsData, setClientsData] = useState(null);
  const [modelInfoData, setModelInfoData] = useState({ title: '', desc: '' });
  const [roundsData, setRoundsData] = useState(null);
  const [selectedItem, setSelecteItem] = useState({ label: null });
  const [searchOptions, setSearchOptions] = useState([]);

  const getMetricOption = (metricsKey = [], optionList = []) => {
    let options = [];
    optionList.forEach((option, idx) =>
      options.push({ label: option, value: idx }),
    );
    if (options.length > 0) {
      const metricsKeyValue = options.filter(
        (option) => option?.label === metricsKey,
      )[0].value;
      setSelecteItem({ label: metricsKey, value: metricsKeyValue });
    }

    setSearchOptions(options);
    testHandler(metricsKey);
  };

  /**
   * metric 셀렉트 선택
   * @param {Object} value
   */
  const selectInputHandler = (value) => {
    setSelecteItem(value);
    testHandler(value?.label);
  };

  const testHandler = async (metricKey) => {
    await requestMetricData.onMutateAsync({
      queryString: `metric=${metricKey}`,
    });
  };

  const metricDataHandler = (metrics) => {
    setMetricData(metrics);
  };

  const dashboardDataHandler = ({ model, rounds, network, client }) => {
    setModelInfoData(model);
    setRoundsData(rounds);
    setNetworkData(network);
    setClientsData(client);
  };

  const requestMetricData = useRequestMetricData({ metricDataHandler });
  useRequestMetricOptions({ getMetricOption, metricDataHandler });
  useRequestDashboardData({ dashboardDataHandler });

  return (
    <>
      <DashboardContent
        metricData={metricData}
        networkData={networkData}
        clientsData={clientsData}
        roundsData={roundsData}
        modelInfoData={modelInfoData}
        searchOptions={searchOptions}
        selectedItem={selectedItem}
        selectInputHandler={selectInputHandler}
      />
    </>
  );
}

export default DashboardPage;
