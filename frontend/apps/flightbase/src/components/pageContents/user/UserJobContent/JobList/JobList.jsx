import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Tooltip } from '@jonathan/ui-react';
import ContextMenu from '../ContextMenu';
import Status from '@src/components/atoms/Status';
import JobListContent from '../JobListContent';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';

// Custom Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// CSS module
import style from './JobList.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const JobList = ({
  data,
  trainingInfo,
  openDeleteConfirmPopup,
  onSelect,
  onViewLog,
  selectedRows,
  onStopJob,
  onStopJobs,
  tid,
  wid,
  isAllOpen,
  manualOpenHandler,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const { id: traingId, type: trainingType } = trainingInfo;
  const {
    name,
    group_id: groupId,
    options,
    gpu_count: gpuCount,
    status,
    status_counting: statusCount,
    docker_image_name: dockerImage,
    dataset_name: dataset,
    create_datetime: createDatetime,
    creator,
    jobs,
    run_code: runCode,
  } = data;
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAccel = options.gpu_acceleration === 1;
  const isUM = options.um === 1;
  const isRDMA = options.rdma === 1;
  const [checkpointList, setCheckpointList] = useState(false);
  const [jobIdx, setJobIdx] = useState(0);

  /**
   * Deploymnet 생성 모달
   */
  const onCreateDeployment = (jobName, jobIdx) => {
    dispatch(
      openModal({
        modalType: 'CREATE_DEPLOYMENT',
        modalData: {
          submit: {
            text: t('create.label'),
            func: () => {
              dispatch(closeModal('CREATE_DEPLOYMENT'));

              dispatch(
                openConfirm({
                  title: 'moveDeploymentPopup.label',
                  content: 'moveDeploymentPopup.message',
                  submit: {
                    text: 'move.label',
                    func: () => {
                      history.push({
                        pathname: `/user/workspace/${wid}/deployments`,
                      });
                    },
                  },
                  cancel: {
                    text: 'cancel.label',
                  },
                }),
              );
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          workspaceId: wid,
          checkpoint: true,
          jobName,
          jobIdx,
          modelName: trainingInfo?.name,
          dockerImageName: dockerImage,
          fromTraining: true,
        },
      }),
    );
  };

  /**
   * 배포생성 모달 open 여부 API 호출
   * GET
   *
   */
  const detailOpenHandler = async () => {
    manualOpenHandler(null);
    setIsOpen(!isOpen);
    getCheckpointList();
  };

  const getCheckpointList = useCallback(async () => {
    const response = await callApi({
      url: `options/jobs/checkpoint_exist?training_id=${tid}&job_group_number=${groupId}`,
      method: 'GET',
    });
    const { result, status } = response;

    if (status === STATUS_SUCCESS) {
      const { job_checkpoint_info: checkpointList } = result;
      const checkpointArray = [];
      const jobIdxArray = [];
      checkpointList?.forEach((v, i) => {
        checkpointArray.push(v?.exist_checkpoint);
        jobIdxArray.push(v?.job_index);
      });

      setCheckpointList(checkpointArray);
      setJobIdx(jobIdxArray);
      return true;
    } else {
      setCheckpointList([]);
      return false;
    }
  }, [groupId, tid]);

  // 체크포인트 유무 주기적 확인
  useIntervalCall(getCheckpointList, 5000);

  useEffect(() => {
    if (isAllOpen) {
      setIsOpen(true);
      getCheckpointList();
    } else if (isAllOpen === false) {
      // null 값도 존재
      setIsOpen(false);
    }
  }, [isAllOpen, getCheckpointList]);

  return (
    <div id={`Job_${name}`} className={cx('list-box')}>
      <div className={cx('group-head', isOpen && 'open')}>
        <div className={cx('first')}>
          <div className={cx('fixed-div')}>
            <img
              src='/images/icon/ic-left.svg'
              alt='open'
              className={cx('arrow-btn', isOpen && 'open')}
              onClick={() => detailOpenHandler()}
            />
            <Status status={status} type='dark' />
            <div className={cx('job-info-box')}>
              <div className={cx('group-name')}>{name}</div>
              <div className={cx('group-info')}>
                <div className={cx('status-count')}>
                  <span className={cx('bullet', 'pending')}></span>
                  <label className={cx('label')}>{t('pending')}</label>
                  <span className={cx('value')}>{statusCount.pending}</span>
                  <span className={cx('bullet', 'done')}></span>
                  <label className={cx('label')}>{t('done')}</label>
                  <span className={cx('value')}>{statusCount.done}</span>
                </div>
                <div className={cx('gpu-count')}>
                  <label className={cx('label')}>{t('gpuUsed.label')}</label>
                  <span className={cx('value')}>{gpuCount || '-'}</span>
                </div>
                <div className={cx('features')}>
                  {isAccel && <span className={cx('features-tag')}>ACCEL</span>}
                  {isUM && <span className={cx('features-tag')}>UM</span>}
                  {isRDMA && <span className={cx('features-tag')}>RDMA</span>}
                </div>
              </div>
            </div>
          </div>
          <div className={cx('tool-box')}>
            <img
              src='/images/icon/ic-ellipsis-v.svg'
              alt='menu'
              className={cx('menu')}
              onClick={() => setIsMenuOpen(true)}
            />
            {isMenuOpen && (
              <ContextMenu
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                status={status}
                onStop={() => onStopJobs(traingId, groupId)}
                openDeleteConfirmPopup={() => {
                  openDeleteConfirmPopup(groupId, false);
                }}
              />
            )}
          </div>
        </div>
        <div className={cx('second')}>
          <div className={cx('job-info-box', `${trainingType}`)}>
            <div>
              <label className={cx('label')}>{t('dockerImage.label')}</label>
              <span className={cx('value')} title={dockerImage}>
                {dockerImage || '-'}
              </span>
            </div>
            <div>
              <label className={cx('label')}>
                {t('dataset.label')}
                {trainingType === 'built-in' && (
                  <Tooltip
                    contents={`${t('dataset.label')} = /user_dataset/`}
                    contentsAlign={{ vertical: 'top', horizontal: 'center' }}
                  />
                )}
              </label>
              <span className={cx('value')} title={dataset}>
                {dataset || '-'}
              </span>
            </div>
            {trainingType !== 'built-in' && (
              <div className={cx('run-code')}>
                <label className={cx('label')}>{t('runCode.label')}</label>
                <span className={cx('value')} title={runCode}>
                  {runCode}
                </span>
              </div>
            )}
            <div className={cx('datetime')}>
              <label className={cx('value', 'medium')}>
                {convertLocalTime(createDatetime)}
              </label>
              <span className={cx('value', 'medium')}>{creator}</span>
            </div>
          </div>
          <div className={cx('tool-box')}>
            <img
              src='/images/icon/ic-ellipsis-v.svg'
              alt='menu'
              className={cx('menu')}
              onClick={() => setIsMenuOpen(true)}
            />
            {isMenuOpen && (
              <ContextMenu
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                status={status}
                onStop={() => onStopJobs(traingId, groupId)}
                openDeleteConfirmPopup={() =>
                  openDeleteConfirmPopup(groupId, false)
                }
              />
            )}
          </div>
        </div>
      </div>
      {isOpen &&
        jobs.map((list, i) => {
          return (
            <JobListContent
              key={list.id}
              trainingType={trainingType}
              jobName={name}
              data={list}
              onViewLog={onViewLog}
              onSelect={onSelect}
              checked={
                selectedRows.filter((rowId) => rowId === list.id).length > 0
              }
              onStopJob={() => {
                onStopJob(list.id);
              }}
              checkpointIsOpen={checkpointList[i]}
              onCreateDeployment={onCreateDeployment}
              jobIdx={jobIdx[i]}
            />
          );
        })}
    </div>
  );
};

export default JobList;
