import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { startPath } from '@src/store/modules/breadCrumb';

// Icons
import logIcon from '@src/static/images/icon/ic-text-log-blue.svg';
import stopIcon from '@src/static/images/icon/ic-stop-red.svg';
import deleteIcon from '@src/static/images/icon/ic-delete-red.svg';

// Components
import { Button } from '@jonathan/ui-react';
import DeployStatusCard from '@src/components/molecules/DeployStatusCard';
import WorkerInfo from '@src/components/pageContents/user/DeployWorkerContent/DeployWorker/WorkerInfo';
import WorkerSearchResultBox from '@src/components/pageContents/user/DeployWorkerContent/DeployWorker/WorkerSearchResultBox';
import ConfirmPopup from '@src/components/organisms/ConfirmPopup';
import ResourceGraph from './ResourceGraph';

// CSS Module
import classNames from 'classnames/bind';
import style from './WorkerDetail.module.scss';
const cx = classNames.bind(style);

function WorkerDetail({
  workerId,
  totalInfoData,
  resourceInfoData,
  detailInfoData,
  detailInfoOverview,
  resourceGraphData,
  searchType,
  startDate,
  endDate,
  minDate,
  resolution,
  resolutionList,
  historyGraphData,
  searchResultInfoData,
  statusCodeData,
  errorRecordData,
  processTimeResponseTimeList,
  workerMemoModalHandler,
  selectedGraph,
  onSelectGraph,
  openStopModal,
  gotoList,
  logDownOptions,
  selectedGraphPer,
  logDownOptionsHandler,
  onDownloadCallLogs,
  workerStopHandler,
  requestHistoryGraphData,
  stopWorkerRequest,
  onChangeDate,
  onChangeSearchType,
  onChangeResolution,
  detailInfoOverviewHandler,
  onDownloadErrorRecord,
  onSelectProcessTime,
  onSelectResponseType,
  workerStatus,
  openDeleteWorkerModal,
  getSystemLogData,
  systemLogLoading,
  title,
}) {
  const { t } = useTranslation();

  // Redux Hooks
  const dispatch = useDispatch();

  // Router Hooks
  const match = useRouteMatch();
  const history = useHistory();
  const { id: wid, did } = match.params;
  title = history.location?.title || title;
  const permissionLevel = history.location.state?.permissionLevel;
  /**
   * Action 브래드크럼
   */
  const breadCrumbHandler = () => {
    dispatch(
      startPath([
        {
          component: {
            name: 'Serving',
            path: `/user/workspace/${wid}/deployments`,
            t,
          },
        },
        {
          component: {
            name: 'Deployment',
            path: `/user/workspace/${wid}/deployments`,
            t,
          },
        },
        {
          component: {
            name: title,
            path: `/user/workspace/${wid}/deployments/${did}/dashboard`,
          },
        },
        {
          component: {
            name: 'Worker',
            path: `/user/workspace/${wid}/deployments/${did}/workers`,
            t,
          },
        },
        {
          component: {
            name: `Worker`,
            secondName: ` ${workerId}`,
            t,
          },
        },
      ]),
    );
  };

  useEffect(() => {
    breadCrumbHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cx('worker-detail-wrap')}>
      <div className={cx('back-to-list')} onClick={gotoList}>
        <img
          className={cx('back-btn-image')}
          src='/images/icon/00-ic-basic-arrow-02-left.svg'
          alt='<'
        />
        <span className={cx('back-btn-label')}>
          {workerStatus === 'running'
            ? t('runningWorker.backToList.label')
            : t('stoppedWorker.backToList.label')}
        </span>
      </div>
      <div className={cx('worker-detail-header')}>
        <h2 className={cx('worker-name')}>
          {t('worker.label')} {workerId}
          {workerStatus === 'stop' && ` (${t('worker.stopped.tab.label')})`}
        </h2>
        <div className={cx('worker-btn')}>
          <div className={cx('system-btn')}>
            <Button
              type='primary-light'
              icon={logIcon}
              iconAlign='left'
              onClick={() => getSystemLogData(workerId)}
              loading={systemLogLoading}
            >
              {t('systemLog.label')}
            </Button>
          </div>
          {workerStatus === 'running' ? (
            <Button
              type='red-light'
              icon={stopIcon}
              iconAlign='left'
              onClick={() => {
                workerStopHandler(true);
              }}
            >
              {t('stopWorker.label')}
            </Button>
          ) : (
            <Button
              type='red-light'
              icon={deleteIcon}
              iconAlign='left'
              onClick={openDeleteWorkerModal}
              disabled={permissionLevel > 3}
            >
              {t('deleteWorker.label')}
            </Button>
          )}
        </div>
      </div>
      <DeployStatusCard
        type='workerDashboard'
        totalInfoData={totalInfoData}
        resourceInfoData={resourceInfoData}
        visibleUsageChart={false}
        isWorker={true}
      />
      {workerStatus === 'running' && (
        <ResourceGraph
          memGraphData={resourceGraphData.memGraphData}
          cpuGraphData={resourceGraphData.cpuGraphData}
          gpuGraphData={resourceGraphData.gpuGraphData}
          t={t}
        />
      )}
      <WorkerInfo
        workerId={workerId}
        detailInfoData={detailInfoData}
        detailInfoOverview={detailInfoOverview}
        detailInfoOverviewHandler={detailInfoOverviewHandler}
        workerMemoModalHandler={workerMemoModalHandler}
      />
      <WorkerSearchResultBox
        workerStatus={workerStatus}
        searchType={searchType}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        resolution={resolution}
        resolutionList={resolutionList}
        infoData={searchResultInfoData}
        statusCodeData={statusCodeData}
        errorRecordData={errorRecordData}
        selectedGraph={selectedGraph}
        historyGraphData={historyGraphData}
        processTimeResponseTimeList={processTimeResponseTimeList}
        onChangeDate={onChangeDate}
        requestHistoryGraphData={requestHistoryGraphData}
        logDownOptions={logDownOptions}
        logDownOptionsHandler={logDownOptionsHandler}
        selectedGraphPer={selectedGraphPer}
        onSelectProcessTime={onSelectProcessTime}
        onSelectResponseType={onSelectResponseType}
        onDownloadCallLogs={onDownloadCallLogs}
        onChangeResolution={onChangeResolution}
        onChangeSearchType={onChangeSearchType}
        onSelectGraph={onSelectGraph}
        onDownloadErrorRecord={onDownloadErrorRecord}
      />
      {openStopModal && (
        <ConfirmPopup
          close={() => {
            workerStopHandler(false);
          }}
          title='stopWorker.label'
          content='deploymentWorker.stopModalContent'
          submit={{
            text: 'stopWorker.label',
            func: stopWorkerRequest,
          }}
          cancel={{
            text: 'cancel.label',
          }}
        />
      )}
    </div>
  );
}

export default WorkerDetail;
