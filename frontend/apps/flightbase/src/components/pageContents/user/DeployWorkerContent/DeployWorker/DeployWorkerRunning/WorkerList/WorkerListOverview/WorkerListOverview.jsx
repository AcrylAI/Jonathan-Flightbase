// Components
import { Tooltip } from '@jonathan/ui-react';
import OverviewGPUChart from './OverviewGPUChart';

// Icons
import alert from '@src/static/images/icon/00-ic-alert-info-o.svg';
import DeployLineChart from '@src/components/molecules/DeployChart/DeployLineChart';

// Utils
import { numberWithCommas } from '@src/utils';

// CSS module
import classNames from 'classnames/bind';
import style from './WorkerListOverview.module.scss';
const cx = classNames.bind(style);

function WorkerListOverview({
  memGraphData,
  cpuGraphData,
  gpuGraphData,
  description,
  deploymentWorkerId,
  workerStatus: { restart_count: restartCount },
  runningInfo,
  workerMemoModalHandler,
  t,
}) {
  return (
    <div className={cx('overview')}>
      <div className={cx('left')}>
        <div className={cx('info')}>
          <span>{t('configuration.label')}</span>
          <div className={cx('overview-info')}>
            {runningInfo[0].configurations}
          </div>
          <span className={cx('restart-cnt-label')}>
            {t('restartCount.label')}
            <Tooltip
              icon={alert}
              iconCustomStyle={{
                width: '20px',
                height: '20px',
              }}
              contents={t('deploymentWorker.overview.restartCountInfo')}
            />
          </span>
          <div className={cx('overview-info')}>
            {numberWithCommas(restartCount)}
          </div>
        </div>
        <div className={cx('memo')}>
          <div className={cx('memo-controler')}>
            <span>{t('memo.label')}</span>
            <label
              onClick={() => {
                workerMemoModalHandler(deploymentWorkerId, description);
              }}
            >
              {t('edit.label')}
            </label>
          </div>
          <div className={cx('memo-output')}>{description}</div>
        </div>
      </div>
      <div className={cx('right')}>
        <div className={cx('chart-wrap')}>
          <div className={cx('overview-chart', 'ram')}>
            <div className={cx('chart-label')}>
              <label>
                RAM : <span className={cx('value')}>{runningInfo[2].ram}</span>
              </label>
              <label>{t('last5m.label')}</label>
            </div>
            <div className={cx('chart-area')}>
              <DeployLineChart
                data={memGraphData}
                height={178}
                enableGridX={false}
                enableGridY={false}
                filled={true}
              />
            </div>
          </div>
          <div className={cx('overview-chart', 'cpu')}>
            <div className={cx('chart-label')}>
              <label>
                CPU :{' '}
                <span className={cx('value')}>{runningInfo[1].cpu_cores}</span>
              </label>
              <label>{t('last5m.label')}</label>
            </div>
            <div className={cx('chart-area')}>
              <DeployLineChart
                data={cpuGraphData}
                height={178}
                enableGridX={false}
                enableGridY={false}
                filled={true}
              />
            </div>
          </div>
          {gpuGraphData && gpuGraphData.length > 0 && (
            <OverviewGPUChart gpuGraphData={gpuGraphData} t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerListOverview;
