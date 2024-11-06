import { useState, useCallback, useEffect } from 'react';
// i18n
import { useTranslation } from 'react-i18next';

// import { Flow } from '@jonathan/ui-react';
import Flow from '@src/components/uiContents/Flow';

import classNames from 'classnames/bind';
import style from './ResultModel.module.scss';
const cx = classNames.bind(style);

function ResultModel({ data }) {
  const { training, broadcasting, aggregation } = data?.round_summary;
  const { t } = useTranslation();
  const [flowData, setFlowData] = useState(null);

  const makeFlowData = useCallback(() => {
    const dataObj = {};
    dataObj.trainingStageStatus = training?.stage_status;
    dataObj.broadcastingStageStatus = broadcasting?.stage_status;
    dataObj.aggregationStatus = aggregation?.stage_status;
    if (aggregation?.stage_status === 3 && aggregation?.stage_status_reason)
      dataObj.stageFailReason = aggregation.stage_status_reason;
    let dataArray = [];

    const trainingClientList = training?.client_list;
    const broadcastClientList = broadcasting?.client_list;
    trainingClientList?.forEach((data, index) => {
      let obj = {
        clientName: data.client_name,
        metrics: data.metrics,
        trainingStatus: data.training_status,
        testStatus: data.test_status,
        broadcastingStatus: broadcastClientList[index].broadcasting_status,
      };
      dataArray.push(obj);
    });
    dataObj.data = dataArray;
    if (aggregation?.metrics) {
      let metricsArray = [];
      aggregation.metrics?.forEach((data) => {
        let obj = {};
        obj.metric = data.metric;
        obj.seedModel = data.seed_model;
        obj.resultModel = data.global_model;
        obj.change_direction = data.change_direction;
        metricsArray.push(obj);
      });
      dataObj.globalModelData = metricsArray;
    }
    setFlowData((flowData) => ({ ...flowData, dataObj }));
  }, [aggregation, broadcasting, training]);

  useEffect(() => {
    makeFlowData();
  }, [makeFlowData]);

  return (
    <div className={cx('round-summary')}>
      <span className={cx('title')}>
        {t('round.label')} {t('summary.label')}
      </span>
      <div className={cx('chart-area')}>
        {flowData && (
          <Flow
            metricLabel={t('roundDetail.metric.label')}
            seedModelLabel={t('roundDetail.resultModel.label')}
            resultModelLabel={t('roundDetail.tab.resultModel.label')}
            data={flowData.dataObj}
            width={'100%'}
            height={'500px'}
          />
        )}
      </div>
    </div>
  );
}

export default ResultModel;
