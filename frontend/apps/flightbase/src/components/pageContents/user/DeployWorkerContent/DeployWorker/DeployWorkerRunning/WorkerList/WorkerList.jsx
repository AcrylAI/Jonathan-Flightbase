import { useState, useRef } from 'react';

// Components
import ConfirmPopup from '@src/components/organisms/ConfirmPopup';
import WorkerListPreview from './WorkerListPreview';
import WorkerListOverview from './WorkerListOverview';

// CSS module
import classNames from 'classnames/bind';
import style from './WorkerList.module.scss';
const cx = classNames.bind(style);

/*
worker
{
  deployment_worker_id: number,
  description: string,
  run_env: [
    { docker_image: string },
    { gpu_model: string | null, changed: boolean },
    { gpu_count: number, changed: boolean },
    { run_code: string }
  ],
  run_time: number,
  run_version: [
    { status: string },
    { gpu_count: number},
    { image: string },
    { run_code: string }
    { training_name: string }
  ],
  running_info: [
    { configurations: string },
    { cpu_coures: string },
    { ram: string },
    { gpus: string[] },
    { network: null | string},
    { call_count_chart: number[] },
    { median_chart: number[] },
    { abnormal_count: number[] }
  ],
  worker_status: {
    interbal: 18100,
    phase: string,
    reason: null | string,
    restart_count: number,
    status: string
  }
}
*/

function WorkerList({
  worker,
  memGraphData,
  cpuGraphData,
  gpuGraphData,
  overview,
  workerStopPopup,
  workerStopConfirmPopupHandler,
  stopWorkerRequest,
  overviewHandler,
  workerMemoModalHandler,
  moveToWorkerDetail,
  getSystemLogData,
  systemLogLoading,
  workerIds,
  t,
}) {
  const [stopBtn, setStopBtn] = useState(false);
  const [previewBtn, setPreviewBtn] = useState(false);
  const detailRef = useRef(null);
  const workerListRef = useRef(null);
  const {
    deployment_worker_id,
    worker_status,
    running_info,
    description,
    run_version,
  } = worker;
  const installing = worker_status.status === 'installing';
  const changed = run_version[0].changed;
  const changedItems = run_version[0].changed_items;

  const mouseOver = (type) => {
    if (type === 'stop') {
      setStopBtn(true);
      return;
    }
    setPreviewBtn(true);
  };

  const mouseOut = (type) => {
    if (type === 'stop') {
      setStopBtn(false);
      return;
    }
    setPreviewBtn(false);
  };

  return (
    <>
      <div
        ref={workerListRef}
        onClick={() => {
          if (
            !stopBtn &&
            !previewBtn &&
            worker_status.status !== 'installing'
          ) {
            moveToWorkerDetail(deployment_worker_id);
          }
        }}
        className={cx(
          'worker-info-box',
          !stopBtn &&
            !previewBtn &&
            worker_status.status !== 'installing' &&
            'hover',
        )}
      >
        <WorkerListPreview
          deploymentWorkerId={deployment_worker_id}
          workerStatus={worker_status}
          changed={changed}
          changedItems={changedItems}
          installing={installing}
          runningInfo={running_info}
          overview={overview}
          workerStopPopup={workerStopPopup}
          overviewHandler={overviewHandler}
          moveToWorkerDetail={moveToWorkerDetail}
          stopWorkerRequest={stopWorkerRequest}
          workerStopConfirmPopupHandler={workerStopConfirmPopupHandler}
          mouseOver={mouseOver}
          mouseOut={mouseOut}
          getSystemLogData={getSystemLogData}
          systemLogLoading={systemLogLoading}
          workerIds={workerIds}
          t={t}
        />
      </div>
      <div ref={detailRef}>
        {overview && (
          <WorkerListOverview
            memGraphData={memGraphData}
            cpuGraphData={cpuGraphData}
            gpuGraphData={gpuGraphData}
            deploymentWorkerId={deployment_worker_id}
            workerStatus={worker_status}
            runningInfo={running_info}
            description={description}
            workerMemoModalHandler={workerMemoModalHandler}
            t={t}
          />
        )}
      </div>
      {typeof workerStopPopup === 'number' &&
        workerStopPopup === deployment_worker_id && (
          <ConfirmPopup
            close={workerStopConfirmPopupHandler}
            title='stopWorker.label'
            content='deploymentWorker.stopModalContent'
            submit={{
              text: 'stopWorker.label',
              func: (e) => {
                e.preventDefault();
                stopWorkerRequest(deployment_worker_id);
              },
            }}
            cancel={{
              text: 'cancel.label',
            }}
          />
        )}
    </>
  );
}

export default WorkerList;
