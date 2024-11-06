// Atom
import { Button, Tooltip, BarLineChart, BarChart } from '@jonathan/ui-react';

// lodash
import _ from 'lodash';

// Icons
import alert from '@src/static/images/icon/00-ic-alert-info-o.svg';
import error from '@src/static/images/icon/00-ic-alert-warning-yellow.svg';
import upIcon from '@src/static/images/icon/00-ic-basic-arrow-02-up-blue.svg';
import downIcon from '@src/static/images/icon/00-ic-basic-arrow-02-down-blue.svg';

// CSS module
import classNames from 'classnames/bind';
import style from './WorkerListPreview.module.scss';
const cx = classNames.bind(style);

function WorkerListPreview({
  deploymentWorkerId,
  workerStatus: { status, reason, resolution },
  changed,
  changedItems,
  overview,
  installing,
  runningInfo,
  workerStopConfirmPopupHandler,
  overviewHandler,
  mouseOver,
  mouseOut,
  getSystemLogData,
  systemLogLoading,
  workerIds,
  t,
}) {
  const previewChart = [
    {
      label: 'callCount.label',
      tootipLabel: 'deploymentWorker.preview.callCountInfo',
    },
    {
      label: 'abnormalProcessing.label',
      tootipLabel: 'deploymentWorker.preview.abnormalProcessingInfo',
    },
  ];

  const makeLeftChartData = () => {
    const callCntChart = runningInfo[5].call_count_chart;
    const medianChart = runningInfo[6].median_chart;
    const arr = [];
    callCntChart.forEach((data, idx) => {
      arr[idx] = {
        callCnt: data,
        xAxisData: idx,
      };
    });
    medianChart.forEach((data, idx) => {
      arr[idx] = {
        ...arr[idx],
        median: data,
      };
    });
    const makeData = {
      lineDataSelector: 'median',
      barDataSelector: 'callCnt',
      xAxisSelector: 'xAxisData',
      data: arr,
    };
    return makeData;
  };

  const makeRightChartData = () => {
    const nginx = runningInfo[7].nginx_abnormal_count_chart;
    const abnormalCnt = runningInfo[8].api_monitor_abnormal_count_chart;
    const arr = [];
    nginx.forEach((data, idx) => {
      arr[idx] = {
        ...arr[idx],
        barData: [
          {
            value: data,
            color: '#CCFCC',
          },
        ],
      };
    });
    abnormalCnt.forEach((data, idx) => {
      arr[idx] = {
        ...arr[idx],
        barData: [
          ...arr[idx].barData,
          {
            value: data,
            color: '#9999FF',
          },
        ],
      };
    });
    const makeData = {
      xAxisSelector: 'xAxisData',
      dataSelector: 'barData',
      data: arr,
    };

    return makeData;
  };

  return (
    <div className={cx('preview')}>
      <div className={cx('left')}>
        <div className={cx('worker-status')}>
          <label className={cx(status)}>
            <div></div>
            {t('worker.label')} {deploymentWorkerId}
          </label>
          {changed === true && (
            <Tooltip
              icon={error}
              iconCustomStyle={{
                width: '20px',
                height: '20px',
              }}
              contentsAlign={{ vertical: 'top' }}
              contents={changedItems.map(
                (
                  { item, current_version: current, latest_version: latest },
                  idx,
                ) => (
                  <div key={idx} className={cx('tooltip-contents-box')}>
                    <label>[{t(`${_.camelCase(item)}.label`)}]</label>
                    <div>
                      <b>{t('currentVersion.label')}:</b>{' '}
                      {current && typeof current === 'object'
                        ? Object.keys(current).join(', ')
                        : Array.isArray(current)
                        ? current.join(', ')
                        : current || '-'}
                    </div>
                    <div>
                      <b>{t('latestVersion.label')}:</b>{' '}
                      {latest && typeof latest === 'object'
                        ? Object.keys(latest).join(', ')
                        : Array.isArray(latest)
                        ? latest.join(', ')
                        : latest || '-'}
                    </div>
                  </div>
                ),
              )}
            />
          )}
          {status === 'error' && (
            <Tooltip
              icon={error}
              iconCustomStyle={{
                width: '20px',
                height: '20px',
              }}
              contentsAlign={{ vertical: 'top' }}
              title={reason}
              contents={resolution}
            />
          )}
        </div>
        <div className={cx('btn-box')}>
          <div className={cx('system-log-btn')}>
            <Button
              type='primary-reverse'
              onClick={() => getSystemLogData(deploymentWorkerId)}
              onMouseOver={() => {
                mouseOver('stop');
              }}
              onMouseOut={() => {
                mouseOut('stop');
              }}
              loading={
                systemLogLoading && workerIds.includes(deploymentWorkerId)
              }
            >
              {t('systemLog.label')}
            </Button>
          </div>
          <div className={cx('worker-stop-btn')}>
            <Button
              type='red-reverse'
              disabled={status === 'stop'}
              onClick={() => {
                workerStopConfirmPopupHandler(deploymentWorkerId);
              }}
              customStyle={{
                border: 'none',
              }}
              onMouseOver={() => {
                mouseOver('stop');
              }}
              onMouseOut={() => {
                mouseOut('stop');
              }}
            >
              {t('stop.label')}
            </Button>
          </div>
        </div>
      </div>
      <div className={cx('right')}>
        <div className={cx('chart')}>
          {!installing &&
            previewChart.map((chartInfo, idx) => (
              <div className={cx('chart-wrap')} key={idx}>
                <div className={cx('preview-chart')}>
                  <label>
                    {t(chartInfo.label)}
                    <Tooltip
                      icon={alert}
                      iconCustomStyle={{
                        width: '20px',
                        height: '20px',
                      }}
                      contents={t(chartInfo.tootipLabel)}
                    />
                  </label>
                  <label>{t('last24h.label')}</label>
                </div>
                <div className={cx('chart-area')}>
                  {idx === 0 && (
                    <BarLineChart
                      data={makeLeftChartData()}
                      width={360}
                      height={82}
                      barWidth={8}
                      barChartColor='rgba(100, 255, 100, 0.5)'
                      lineChartColor='rgba(0, 0, 255, 0.3)'
                      point={0}
                      isAxisDraw={false}
                      background='rgba(100, 150, 255, 0.1)'
                    />
                  )}
                  {idx === 1 && (
                    <BarChart
                      data={makeRightChartData()}
                      width={360}
                      height={82}
                      barWidth={8}
                      isAxisDraw={false}
                      background='rgba(100, 150, 255, 0.1)'
                    />
                  )}
                </div>
              </div>
            ))}
        </div>
        <div className={cx('overview-append-btn')}>
          {installing && (
            <>
              <label>{t(status)}</label>
              <label className={cx('installing-animation')}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </label>
            </>
          )}
          {!installing && (
            <Button
              type='primary-reverse'
              customStyle={{
                width: '100px',
                height: '40px',
                border: 'none',
                marginLeft: '8px',
              }}
              iconAlign='right'
              iconStyle={{
                width: '16px',
                height: '16px',
              }}
              icon={overview ? upIcon : downIcon}
              onClick={() => {
                overviewHandler(deploymentWorkerId);
              }}
              onMouseOver={() => {
                mouseOver('preview');
              }}
              onMouseOut={() => {
                mouseOut('preview');
              }}
            >
              {t('preview.title.label')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerListPreview;
