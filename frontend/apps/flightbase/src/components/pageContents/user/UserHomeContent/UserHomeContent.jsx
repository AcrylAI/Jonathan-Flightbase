// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';
import { convertBinaryByte } from '@src/utils';

// Components
import StoragePieChart from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StoragePieChart/StoragePieChart';
import TotalCount from '@src/components/organisms/Dashboard/TotalCount';
import UsagePercent from '@src/components/organisms/Dashboard/UsagePercent';
import UsageTimeline from '@src/components/molecules/chart/TimeSeriesChart';
import LatestJob from '@src/components/organisms/Dashboard/LatestJob';
import History from '@src/components/organisms/Dashboard/History';
import Status from '@src/components/atoms/Status';
import { Badge, StatusCard } from '@jonathan/ui-react';

// CSS module
import style from './UserHomeContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

// 최근 학습 현황 표시 여부
const IS_HIDE_JOB = import.meta.env.VITE_REACT_APP_IS_HIDE_JOB === 'true';
const IS_HIDE_HPS = import.meta.env.VITE_REACT_APP_IS_HIDE_HPS === 'true';
// 드론 챌린지 모드 여부
const IS_DNADRONECHALLENGE =
  import.meta.env.VITE_REACT_APP_SERVICE_LOGO === 'DNA+DRONE' &&
  import.meta.env.VITE_REACT_APP_IS_CHALLENGE === 'true';

function UserHomeContent({
  totalCount,
  directLink,
  trainingItems,
  moveJobList,
  history,
  gpuUsage,
  timeline,
  info,
  serverError,
  openWsDescEditModal,
  openGPUSettingEditModal,
  storageData,
  isManager,
}) {
  const { t } = useTranslation();
  const totalCountList = totalCount.map((count) => (
    <TotalCount
      key={count.name}
      name={count.name}
      label={count.name}
      total={count.total}
      variation={count.variation}
      directLink={directLink}
      customStyle={{ margin: '0 10px' }}
    />
  ));

  const gpuUsageChart = gpuUsage.map((gpu) => (
    <UsagePercent
      key={gpu.type}
      name={t(`for${gpu.type}.label`)}
      total={gpu.total}
      used={gpu.used}
      type='user'
    />
  ));

  const latestJobList = trainingItems.map((list, index) => (
    <LatestJob
      key={index}
      name={list.name}
      trainingId={list.training_id}
      trainingName={list.training_name}
      status={list.status}
      count={list.count}
      progress={list.progress}
      moveJobList={moveJobList}
      type={list.type}
    />
  ));

  const historyList = history.map((list, index) => (
    <History key={index} data={list} type='user' />
  ));

  return (
    <div className={cx('dashboard')}>
      <div className={cx('content')}>
        <div className={cx('first-row')}>
          <div className={cx('workspace-info')}>
            <div className={cx('title-div')}>
              <Status status={info.status.toLowerCase()} />
              <div className={cx('workspace-name')}>
                {t('informationOf.label', { name: info.name || '-' })}
              </div>
            </div>
            <div className={cx('workspace-description')}>
              <div className={cx('description')}>{info.description || '-'}</div>
              {isManager && (
                <button
                  className={cx('edit-btn')}
                  onClick={openWsDescEditModal}
                  title={t('edit.label')}
                >
                  <img
                    src='/images/icon/00-ic-basic-pen.svg'
                    alt='desc edit btn'
                  />
                </button>
              )}
            </div>
            <div className={cx('meta')}>
              <label>{t('period.label')}</label>
              <span>
                {info.start_datetime
                  ? `${convertLocalTime(
                      info.start_datetime,
                    )} ~ ${convertLocalTime(info.end_datetime)}`
                  : '-'}
              </span>
            </div>
            <div className={cx('meta')}>
              <label>{t('users.label')}</label>
              <span
                title={`[${t('workspaceManager.label')}] ${
                  info.owner || '-'
                }\n[${t('user.label')}] ${info.users.join(', ') || '-'}`}
              >
                {info.owner || '-'}
                {info.users.length > 0 && ` | ${info.users.join(', ')}`}
              </span>
            </div>
          </div>

          <div className={cx('top-right-contents')}>
            <div className={cx('usage')}>
              <div className={cx('gpu-usage')}>
                <label className={cx('title')}>
                  {t('gpuInUse.label')}
                  {info.guaranteed_gpu === 1 && (
                    <Badge
                      customStyle={{ marginLeft: '4px' }}
                      label='Guaranteed'
                      type='green'
                    />
                  )}
                  {isManager && (
                    <button
                      className={cx('edit-btn')}
                      onClick={openGPUSettingEditModal}
                      title={t('edit.label')}
                    >
                      <img
                        src='/images/icon/00-ic-basic-pen.svg'
                        alt='gpu edit btn'
                      />
                    </button>
                  )}
                </label>
                <div>{gpuUsageChart}</div>
              </div>
            </div>
            <div className={cx('storage-box')}>
              <div className={cx('storage-top')}>
                <div className={cx('title-box')}>
                  <div className={cx('label')}>{t('storageInUse.label')}</div>
                  {storageData && typeof storageData.share === 'number' && (
                    <div className={cx('status-card')}>
                      <StatusCard
                        text={
                          storageData?.share === 1
                            ? t('share.label')
                            : t('allocate.label')
                        }
                        status={storageData?.share ? 'yellow' : 'orange'}
                        size='x-small'
                        customStyle={{
                          width: '31px',
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className={cx('chart-box')}>
                  <div className={cx('chart-graph')}>
                    <StoragePieChart
                      total={
                        storageData?.pcent === '1%'
                          ? 100
                          : storageData?.size
                          ? storageData?.size
                          : 0
                      }
                      value={
                        storageData?.pcent === '1%'
                          ? 1
                          : storageData?.used
                          ? storageData?.used
                          : 0
                      }
                      pcent={storageData?.pcent ? storageData?.pcent : '0%'}
                    />
                  </div>
                  <div className={cx('chart-value')}>
                    <div className={cx('capacity-box')}>
                      <div>
                        <span className={cx('value-title')}>
                          {storageData?.share === 1
                            ? t('workspaceStorageTotal.label')
                            : t('workspaceStorageAllocated.label')}
                        </span>
                        <span className={cx('value')}>
                          {convertBinaryByte(
                            storageData?.size ? Number(storageData.size) : 0,
                          )}
                        </span>
                      </div>
                      <div>
                        <span className={cx('value-title')}>
                          {storageData?.share === 1
                            ? t('storagUsage.label')
                            : t('workspaceUsage.label')}
                        </span>
                        <span className={cx('value')}>
                          {convertBinaryByte(
                            storageData?.used ? Number(storageData.used) : 0,
                          )}
                        </span>
                      </div>
                      <div>
                        <span className={cx('value-title')}>
                          {storageData?.share === 1
                            ? t('storageRemaining.label')
                            : t('workspaceStorageRemaining.label')}
                        </span>
                        <span className={cx('value')}>
                          {convertBinaryByte(
                            storageData?.avail ? Number(storageData.avail) : 0,
                          )}
                        </span>
                      </div>
                      {storageData?.share === 1 && (
                        <div>
                          <span className={cx('value-title')}>
                            {t('workspaceStorageUsage.label')}
                          </span>
                          <span className={cx('value')}>
                            {convertBinaryByte(
                              storageData?.workspaceUsed
                                ? Number(storageData?.workspaceUsed)
                                : 0,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cx('status-box')}>
          {!IS_DNADRONECHALLENGE && (
            <div className={cx('status')}>
              <div className={cx('total-count')}>{totalCountList}</div>
            </div>
          )}
        </div>

        <div className={cx('second-row')}>
          {(!IS_HIDE_JOB || !IS_HIDE_HPS) && (
            <div className={cx('latest-job')}>
              <label className={cx('title')}>{t('myLatestJob.label')}</label>
              {serverError ? (
                <div className={cx('no-response')}>
                  {t('noResponse.message')}
                </div>
              ) : trainingItems.length > 0 ? (
                <div className={cx('history-list')}>{latestJobList}</div>
              ) : (
                <div className={cx('no-history')}>
                  {t('noLatestJob.message')}
                </div>
              )}
            </div>
          )}
          <div className={cx('history')}>
            <label className={cx('title')}>
              {t('recentTasksHistory.label')}
            </label>
            {serverError ? (
              <div className={cx('no-response')}>{t('noResponse.message')}</div>
            ) : history.length > 0 ? (
              <div className={cx('history-list')}>{historyList}</div>
            ) : (
              <div className={cx('no-history')}>
                {t('noRecentTasks.message')}
              </div>
            )}
          </div>
        </div>
        <div className={cx('third-row')}>
          <label className={cx('title')}>{t('gpuUsageChart.label')}</label>
          {serverError ? (
            <div className={cx('no-response')}>{t('noResponse.message')}</div>
          ) : timeline.length > 0 ? (
            <div>
              <UsageTimeline
                tagId={'GpuUsageChart'}
                data={timeline}
                maxValue={100}
                customStyle={{ width: '100%', height: '360px' }}
                dateX='date'
                valueY='usage'
                tooltipText={`${t(
                  'usage.label',
                )}: {used_gpu}/{total_gpu} ({valueY.value.formatNumber('#.##')}%)`}
              />
            </div>
          ) : (
            <div className={cx('no-data')}>{t('noChartData.message')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserHomeContent;
