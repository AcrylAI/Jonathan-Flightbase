import { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

// Components
import RoundDetailPageContents from '@src/components/pageContents/RoundDetailPageContents';

// API Hooks
import useRequestRoundDetailData from './hooks/api/useRequestRoundDetailData';
import useRequestChartData from './hooks/api/useRequestChartData';
import useRequestHpsLogData from './hooks/api/useRequestHpsLogData';

function RoundDetailPage() {
  const history = useHistory();
  const { id } = useParams();

  const { groupId } = history.location?.state;
  const [clientTrainingData, setClientTraingData] = useState(null);
  const [aggregationData, setAggregationData] = useState(null);
  const [resultModelData, setResultModelData] = useState(null);
  const [hpsChartData, setHpsChartData] = useState(null);
  /**
   * 라운드 상세 API
   * @param {{
   *  clientTraining: Object,
   *  aggregation: Object,
   *  resultModel: Object,
   * }}
   */
  const setDatas = ({ clientTraining, aggregation, resultModel }) => {
    setClientTraingData(clientTraining);
    setAggregationData(aggregation);
    setResultModelData(resultModel);
  };

  const getChartData = async ({ id, groupId, sortKey, sortOrder }) => {
    await requestChartData.onMutateAsync({
      queryString: `round_group_name=${groupId}&round_name=${id}&sort_key=${sortKey}&sort_order=${sortOrder}`,
    });
  };

  const getAggregationChartData = (data) => {
    setHpsChartData(data);
  };

  const getHpsLogData = async (groupId, id, hpsId) => {
    const response = await requestHpsLog.onMutateAsync({
      queryString: `round_group_name=${groupId}&round_name=${id}&hps_id=${hpsId}`,
    });
    return response.data;
  };

  // aggregation - hps line chart 데이터 요청
  const requestChartData = useRequestChartData(getAggregationChartData);

  const requestHpsLog = useRequestHpsLogData();
  useRequestRoundDetailData({ id, setDatas });

  return (
    <RoundDetailPageContents
      clientTrainingData={clientTrainingData}
      aggregationData={aggregationData}
      resultModelData={resultModelData}
      roundInfo={{ id, groupId }}
      getChartData={getChartData}
      hpsChartData={hpsChartData}
      getHpsLogData={getHpsLogData}
    />
  );
}

export default RoundDetailPage;
