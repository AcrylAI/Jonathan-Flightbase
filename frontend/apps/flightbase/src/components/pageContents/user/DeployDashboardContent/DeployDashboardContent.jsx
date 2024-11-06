// Components
import DeployStatusCard from '@src/components/molecules/DeployStatusCard';
import WorkerSearchResultBox from '@src/components/pageContents/user/DeployWorkerContent/DeployWorker/WorkerSearchResultBox';

// CSS Module
import classNames from 'classnames/bind';
import style from './DeployDashboardContent.module.scss';
const cx = classNames.bind(style);

function DeployDashboardContent({
  title,
  totalInfoData,
  resourceInfoData,
  loading,
  searchType,
  startDate,
  endDate,
  minDate,
  resolution,
  resolutionList,
  workers,
  workerList,
  infoData,
  chartData,
  historyGraphData,
  selectedGraph,
  statusCodeData,
  errorRecordData,
  onDownloadErrorRecord,
  logDownOptions,
  logDownOptionsHandler,
  selectedGraphPer,
  processTimeResponseTimeList,
  onSelectProcessTime,
  onSelectResponseType,
  onDownloadCallLogs,
  requestHistoryGraphData,
  onChangeDate,
  onChangeWorker,
  onChangeResolution,
  onChangeSearchType,
  onSelectGraph,
}) {
  return (
    <div className={cx('dashboard')}>
      {title && <div className={cx('title')}>{title}</div>}
      <DeployStatusCard
        type='deployDashboard'
        totalInfoData={totalInfoData}
        resourceInfoData={resourceInfoData}
        visibleUsageChart={true}
        isWorker={false}
      />
      <WorkerSearchResultBox
        searchType={searchType}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        loading={loading}
        historyGraphData={historyGraphData}
        selectedGraphPer={selectedGraphPer}
        processTimeResponseTimeList={processTimeResponseTimeList}
        onSelectProcessTime={onSelectProcessTime}
        onSelectResponseType={onSelectResponseType}
        onSelectGraph={onSelectGraph}
        selectedGraph={selectedGraph}
        onChangeDate={onChangeDate}
        resolution={resolution}
        resolutionList={resolutionList}
        onChangeResolution={onChangeResolution}
        workers={workers}
        workerList={workerList}
        onChangeWorker={onChangeWorker}
        requestHistoryGraphData={requestHistoryGraphData}
        infoData={infoData}
        chartData={chartData}
        logDownOptions={logDownOptions}
        logDownOptionsHandler={logDownOptionsHandler}
        onDownloadCallLogs={onDownloadCallLogs}
        statusCodeData={statusCodeData}
        errorRecordData={errorRecordData}
        onChangeSearchType={onChangeSearchType}
        onDownloadErrorRecord={onDownloadErrorRecord}
      />
    </div>
  );
}

export default DeployDashboardContent;
