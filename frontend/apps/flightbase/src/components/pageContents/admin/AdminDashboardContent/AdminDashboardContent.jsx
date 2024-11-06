import { connect } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { StatusCard } from '@jonathan/ui-react';
import TotalCount from '@src/components/organisms/Dashboard/TotalCount';
import History from '@src/components/organisms/Dashboard/History';
import UsageTimeline from '@src/components/molecules/chart/TimeSeriesChart';
import PieChart from '@src/components/molecules/chart/PieChart2';
import StoragePieChart from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StoragePieChart/StoragePieChart';
import StorageTemplate from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageTemplate/StorageTemplate';
import StorageStack from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageStack/StorageStack';
import StorageList from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageList/StorageList';

// Icons
import RefreshIcon from '@src/static/images/icon/refresh.svg';

// Utils
import { convertBinaryByte } from '@src/utils';

// CSS module
import style from './AdminDashboardContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function AdminDashboardContent({
  totalCount,
  directLink,
  history,
  timeline,
  onRefresh,
  nav: { isExpand },
  serverError,
  gpuUsageByType,
  gpuUsageByGuarantee,
  storageTotalData,
  storageTableData,
  loading,
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
    />
  ));

  const historyList = history.map((list, index) => (
    <History key={index} data={list} type='admin' />
  ));
  return (
    <div id='AdminDashboardContent' className={cx('dashboard')}>
      <div className={cx('header', isExpand && 'expand')}>
        <h1 className={cx('welcome')}>
          {t('welcomeBack.message')} Admin{t('sir.label')}!
        </h1>
        <button
          className={cx('refresh', loading && 'loading')}
          onClick={onRefresh}
        >
          <img src={RefreshIcon} alt='refresh' />
          {t('refresh.label')}
        </button>
      </div>
      <div className={cx('content')}>
        <div className={cx('first-row')}>
          <div className={cx('status')}>
            <div className={cx('total-count')}>{totalCountList}</div>
            <div className={cx('usage')}>
              <div className={cx('gpu-usage')}>
                <label className={cx('title')}>{t('gpuInUse.label')}</label>
                <div className={cx('gpu-usage-innerbox')}>
                  <PieChart
                    width='120px'
                    height='120px'
                    data={gpuUsageByType ? gpuUsageByType.chartData : []}
                    total={gpuUsageByType ? gpuUsageByType.total : 0}
                    isLabelCeneter={
                      gpuUsageByType &&
                      gpuUsageByType.chartData.filter(
                        ({ value }) => value === gpuUsageByType.total,
                      ).length !== 0
                    }
                    labelStyle={{
                      fontSize: '6px',
                      fontFamily: 'SpoqaM',
                      fill: '$mono200',
                    }}
                    chartTitle={gpuUsageByType && gpuUsageByType.chartTitle}
                    legend
                  />
                  <PieChart
                    width='120px'
                    height='120px'
                    data={
                      gpuUsageByGuarantee ? gpuUsageByGuarantee.chartData : []
                    }
                    isLabelCeneter={
                      gpuUsageByGuarantee &&
                      gpuUsageByGuarantee.chartData.filter(
                        ({ value }) => value === gpuUsageByGuarantee.total,
                      ).length !== 0
                    }
                    labelStyle={{
                      fontSize: '6px',
                      fontFamily: 'SpoqaM',
                      fill: '$mono200',
                    }}
                    total={gpuUsageByGuarantee ? gpuUsageByGuarantee.total : 0}
                    chartTitle={
                      gpuUsageByGuarantee && gpuUsageByGuarantee.chartTitle
                    }
                    legend
                  />
                </div>
              </div>
              <div className={cx('storage')}>
                <StorageTemplate
                  pieChartRender={
                    <StoragePieChart
                      title={t('storageInUse.label')}
                      titleStyle={{
                        color: '#747474',
                        fontFamily: 'SpoqaM',
                        textAlign: 'left',
                        margin: '4px 0 16px ',
                      }}
                      label={t('active')}
                      total={
                        storageTotalData?.total_size === undefined
                          ? 0
                          : storageTotalData?.total_size
                      }
                      value={
                        storageTotalData?.total_used === undefined
                          ? 0
                          : storageTotalData?.total_used
                      }
                      used={convertBinaryByte(
                        storageTotalData?.total_used === undefined
                          ? 0
                          : storageTotalData?.total_used,
                      )}
                      totalSize={convertBinaryByte(
                        storageTotalData?.total_size === undefined
                          ? 0
                          : storageTotalData?.total_size,
                      )}
                      fontSize={{ fontSize: '16px' }}
                    />
                  }
                  listRender={
                    <StorageList
                      listData={storageTableData}
                      columns={[
                        {
                          label: t('storageServer.label'),
                          selector: 'logical_name',
                          headStyle: {
                            flex: '1 1 100px',
                            color: '#747474',
                            paddingRight: '15px',
                          },
                          bodyStyle: {
                            flex: '1 1 100px',
                            fontSize: '12px',
                            boxSizing: 'contentBox',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingRight: '15px',
                          },
                        },
                        {
                          label: t('distributionType.label'),
                          selector: 'share',
                          headStyle: { flex: '1 1 56px', color: '#747474' },
                          bodyStyle: { flex: '1 1 56px', fontSize: '12px' },
                          cell: ({ share }) => {
                            return (
                              <StatusCard
                                text={
                                  share ? t('share.label') : t('allocate.label')
                                }
                                status={share ? 'yellow' : 'orange'}
                                size='x-small'
                                customStyle={{
                                  width: '31px',
                                }}
                              />
                            );
                          },
                        },
                        {
                          label: (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'start',
                              }}
                            >
                              <div className={cx('bullet-usage')}>
                                {t('usageRate.label')}
                              </div>
                              <div className={cx('bullet-assign')}>
                                {t('allocationRate.label')}
                              </div>
                            </div>
                          ),
                          selector: 'usage',
                          headStyle: { flex: '1 1 100px', color: '#747474' },
                          bodyStyle: { flex: '1 1 100px', fontSize: '12px' },
                          cell: ({ usage }) => {
                            return (
                              <StorageStack
                                usage={Number(usage.pcent.split('%')[0])}
                                allocation={Number(
                                  usage?.allocate_pcent?.split('%')[0],
                                )}
                              />
                            );
                          },
                        },
                      ]}
                    />
                  }
                  customStyle={{ height: '250px', width: '100%' }}
                />
              </div>
            </div>
          </div>
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
        <div className={cx('second-row')}>
          <label className={cx('title')}>{t('gpuUsageChart.label')}</label>
          {serverError ? (
            <div className={cx('no-response')}>{t('noResponse.message')}</div>
          ) : timeline.length > 0 ? (
            <div>
              <UsageTimeline
                tagId='GpuUsageChart'
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

export default connect(({ nav }) => ({ nav }))(AdminDashboardContent);
