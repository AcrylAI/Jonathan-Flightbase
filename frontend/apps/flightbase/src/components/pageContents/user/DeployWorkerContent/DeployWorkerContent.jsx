// Components
import DeployWorker from './DeployWorker';

// CSS Module
import classNames from 'classnames/bind';
import style from './DeployWorkerContent.module.scss';
const cx = classNames.bind(style);

function DeployWorkerContent({
  title,
  workerSettingInfo,
  selectedPage,
  workerList,
  overviewList,
  stopWorkerRequest,
  addWorker,
  tabHandler,
  workerStopPopup,
  workerStopConfirmPopupHandler,
  workerMemoModalHandler,
  onEdit,
  overviewHandler,
  moveToWorkerDetail,
  did,
  getStoppedData,
  workerDeleteClickHandler,
  checkedData,
  onSelect,
  toggledClear,
  workerDownHandler,
  inputValueHandler,
  keyword,
  tableData,
  selectInputHandler,
  searchKey,
  getSystemLogData,
  systemLogLoading,
  workerIds,
  addLoading,
}) {
  return (
    <div className={cx('worker')}>
      {title && <div className={cx('title')}>{title}</div>}
      <DeployWorker
        did={did}
        keyword={keyword}
        tableData={tableData}
        searchKey={searchKey}
        workerIds={workerIds}
        workerList={workerList}
        checkedData={checkedData}
        overviewList={overviewList}
        selectedPage={selectedPage}
        toggledClear={toggledClear}
        workerStopPopup={workerStopPopup}
        systemLogLoading={systemLogLoading}
        workerSettingInfo={workerSettingInfo}
        onEdit={onEdit}
        onSelect={onSelect}
        addWorker={addWorker}
        tabHandler={tabHandler}
        getStoppedData={getStoppedData}
        overviewHandler={overviewHandler}
        getSystemLogData={getSystemLogData}
        workerDownHandler={workerDownHandler}
        inputValueHandler={inputValueHandler}
        stopWorkerRequest={stopWorkerRequest}
        selectInputHandler={selectInputHandler}
        moveToWorkerDetail={moveToWorkerDetail}
        workerMemoModalHandler={workerMemoModalHandler}
        workerDeleteClickHandler={workerDeleteClickHandler}
        workerStopConfirmPopupHandler={workerStopConfirmPopupHandler}
        title={title}
        addLoading={addLoading}
      />
    </div>
  );
}

export default DeployWorkerContent;
