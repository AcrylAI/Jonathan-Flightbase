import { useState, useEffect, useCallback } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import Card from './Card';
import TreeMapChart from '@src/components/molecules/chart/TreeMapChart';
import { toast } from '@src/components/Toast';
import Loading from '@src/components/atoms/loading/Loading';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import style from './SummaryTab.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const SummaryTab = () => {
  const { t } = useTranslation();
  const [wList, setWList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const getWorkspaceData = useCallback(async () => {
    const response = await callApi({
      url: 'records/summary',
      method: 'get',
    });
    const { result, status, message } = response;
    if (status === STATUS_SUCCESS) {
      setWList(result);
      setIsLoading(false);
    } else {
      toast.error(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getWorkspaceData();
  }, [getWorkspaceData]);
  return isLoading ? (
    <div className={cx('loading-box')}>
      <Loading />
    </div>
  ) : (
    <div id='summary-tab'>
      <div className={cx('list-area')}>
        <div className={cx('header')}>
          <h3 className={cx('title')}>
            {t('summaryUsageRecords.title.label')}
          </h3>
        </div>
        {wList.length === 0 ? (
          <div className={cx('no-data')}>{t('noSummary.message')}</div>
        ) : (
          <ul className={cx('list')}>
            {wList.map((ws, idx) => (
              <Card key={idx} data={ws} />
            ))}
          </ul>
        )}
      </div>
      <div className={cx('chart-area')}>
        <div className={cx('header')}>
          <h3 className={cx('title')}>
            {t('summaryUsageRateChart.title.label')}
          </h3>
        </div>
        <TreeMapChart
          tagId='gpu_usage_chart'
          data={wList.filter(
            ({ status, gpu_allocations: gpuAllocations }) =>
              status === 'active' && gpuAllocations > 0,
          )}
          tooltipText={`[[{workspace_name}]] GPU ${t(
            'usageRate.label',
          )}: [bold]{usage_rate}%[/]`}
          label='workspace_name'
          value='gpu_allocations'
        />
      </div>
    </div>
  );
};

export default SummaryTab;
