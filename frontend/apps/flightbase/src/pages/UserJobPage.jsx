import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import JobContent from '@src/components/pageContents/user/UserJobContent';

// Custom Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';
import { startPath } from '@src/store/modules/breadCrumb';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import {
  deepCopy,
  defaultSuccessToastMessage,
  errorToastMessage,
} from '@src/utils';

function UserJobPage({ trackingEvent }) {
  const mounted = useRef(false);
  const { t } = useTranslation();

  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const { id: wid, tid } = match.params;

  // Redux hooks
  const dispatch = useDispatch();

  // State
  const [originJobListData, setOriginJobListData] = useState([]);
  const [jobListData, setJobListData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [createBtnDisabled, setCreateBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalJobRows, setTotalJobRows] = useState(null);
  const [jobSearchKey, setJobSearchKey] = useState({
    label: 'jobName.label',
    value: 'name',
  });
  const [jobKeyword, setJobKeyword] = useState('');
  const [trainingInfo, setTrainingInfo] = useState({
    id: '',
    name: '',
    desc: '',
    type: '',
    access: 0,
    gpuCount: 0,
    modelName: null,
    trainingToolInfo: null,
    trainingResource: null,
  });
  const [toolInfo, setToolInfo] = useState({
    dockerImageName: '',
    gpuCount: 0,
    gpuModel: [],
    toolId: null,
  });

  /**
   * Action 브래드크럼
   * @param {String} trainingName
   */
  const breadCrumbHandler = useCallback(
    (trainingName) => {
      if (trainingName) {
        dispatch(
          startPath([
            {
              component: {
                name: 'Training',
                path: `/user/workspace/${wid}/trainings`,
                t,
              },
            },
            {
              component: {
                name: trainingName,
                path: `/user/workspace/${wid}/trainings/${tid}/workbench`,
              },
            },
            {
              component: {
                name: 'Workbench',
                path: `/user/workspace/${wid}/trainings/${tid}/workbench`,
                t,
              },
            },
            {
              component: { name: 'JOB' },
            },
          ]),
        );
      }
    },
    [dispatch, tid, wid, t],
  );

  /**
   * API 호출 GET
   * Job 데이터 가져오기
   *
   */
  const getJobs = useCallback(async () => {
    const response = await callApi({
      url: `trainings/jobs?training_id=${tid}`,
      method: 'GET',
    });
    const { status, result, message, error } = response;
    if (mounted.current) {
      if (status === STATUS_SUCCESS) {
        const {
          list,
          total,
          status,
          training_tool: trainingInfo,
          training_tool_info: toolInfo,
        } = result;

        breadCrumbHandler(trainingInfo?.training_name);
        setOriginJobListData(deepCopy(list));

        if (jobKeyword === '') {
          setJobListData(list);
        }
        setTotalJobRows(total);
        setLoading(false);
        setCreateBtnDisabled(status === 'reserved' || status === 'expired');
        setTrainingInfo({
          id: trainingInfo?.training_id,
          name: trainingInfo?.training_name,
          desc: trainingInfo?.training_description,
          type: trainingInfo?.training_type,
          access: trainingInfo?.access,
          gpuCount: trainingInfo?.training_gpu_count,
          modelName: trainingInfo?.training_built_in_model_name,
          trainingToolInfo: trainingInfo?.training_tool_info,
          trainingResource: trainingInfo?.training_resource,
        });
        setToolInfo({
          dockerImageName: toolInfo.docker_image_name,
          gpuCount: toolInfo.gpu_count,
          gpuModel: toolInfo?.gpu_model ? Object.keys(toolInfo.gpu_model) : [],
          toolId: toolInfo.tool_id,
        });
        return true;
      }
      errorToastMessage(error, message);
      return true;
    }
  }, [breadCrumbHandler, jobKeyword, tid]);

  /**
   * 실행 중인 작업 중지
   *
   * @param {number} id 작업 ID
   */
  const onStopJob = async (id) => {
    trackingEvent({
      category: 'User Job Page',
      action: 'Stop Job',
    });
    const response = await callApi({
      url: `trainings/stop_job?job_id=${id}`,
      method: 'GET',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('stop');
      getJobs();
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 학습 내 실행 중인 JOB 전체 중지
   *
   * @param {number} trainingId 학습 ID
   * @param {number} groupId 그룹 ID
   */
  const onStopJobs = async (trainingId, groupId) => {
    trackingEvent({
      category: 'User Job Page',
      action: 'Stop Jobs',
    });
    const response = await callApi({
      url: `trainings/stop_jobs?training_id=${trainingId}&job_group_number=${groupId}`,
      method: 'GET',
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('stop');
      getJobs();
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * JOB 생성
   */
  const onCreateJob = () => {
    dispatch(
      openModal({
        modalType: 'CREATE_JOB',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              getJobs();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: { tid, wid },
          builtName: trainingInfo.name,
        },
      }),
    );
    trackingEvent({
      category: 'User Job Page',
      action: 'Open Create Job Modal',
    });
  };

  /**
   * JOB 로그 모달 열기
   *
   * @param {object} data JOB 정보 및 로그 데이터
   * @param {string} jobName JOB 이름
   */
  const onViewJobLog = async (data, jobName) => {
    dispatch(
      openModal({
        modalType: 'JOB_LOG',
        modalData: {
          submit: {
            text: 'confirm.label',
            func: () => {
              dispatch(closeModal('JOB_LOG'));
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          jobId: data.id,
          jobName,
          jobData: data,
          trainingName: trainingInfo.name,
          trainingType: trainingInfo.type,
        },
      }),
    );
  };

  /**
   * API 호출 DELETE
   * JOB 삭제
   *
   * @param {number} groupId 그룹 ID
   */
  const onDelete = async (groupId = undefined, isAll = false) => {
    let body = {};
    let remainRows = [];
    if (isAll) {
      // 전체 삭제
      body = { training_id: tid };
    } else if (groupId !== undefined) {
      // 그룹으로 삭제
      const groupToDelete = jobListData.filter(
        (t) => t.group_id === groupId,
      )[0];
      const { jobs } = groupToDelete;
      body = { job_id_list: jobs.map((item) => item.id) };
      // 선택된 row 중 삭제될 그룹에 포함된 id를 제거합니다.
      remainRows = selectedRows.filter(
        (rowId) => jobs.filter((item) => item.id === rowId).length <= 0,
      );
    } else {
      // 체크박스 삭제
      body = { job_id_list: selectedRows };
      remainRows = [];
    }
    const response = await callApi({
      url: 'trainings/jobs',
      method: 'delete',
      body,
    });
    const { status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      getJobs();
      setSelectedRows(remainRows);
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * JOB 삭제 확인 모달
   *
   * @param {number} groupId 그룹 ID
   */
  const openDeleteConfirmPopup = (groupId = undefined, isAll) => {
    trackingEvent({
      category: 'User Job Page',
      action: 'Open Delete Job Confirm Popup',
    });
    dispatch(
      openConfirm({
        title: isAll
          ? 'deleteAllJobPopup.title.label'
          : 'deleteJobPopup.title.label',
        content: 'deleteJobPopup.message',
        notice: isAll ? t('deleteJobPopup.notice.message') : '',
        confirmMessage: isAll ? t('deleteAll.label') : '',
        submit: {
          text: 'delete.label',
          func: () => {
            trackingEvent({
              category: 'User Job Page',
              action: 'Delete Job',
            });
            onDelete(groupId, isAll);
          },
        },
        cancel: {
          text: 'cancel.label',
        },
      }),
    );
  };

  /**
   * 체크포인트 팝업
   *
   * @param {number} groupId 그룹 ID
   */
  const openCheckPointPopup = (groupId = undefined) => {
    dispatch(
      openModal({
        modalType: 'CHECKPOINT',
        modalData: {
          submit: {
            text: 'confirm.label',
            func: () => {
              dispatch(closeModal('CHECKPOINT'));
            },
          },
          groupId,
        },
      }),
    );
  };

  /**
   * 검색 셀렉트 박스 이벤트 핸들러
   *
   * @param {string} name 검색할 항목
   * @param {string} value 검색할 내용
   */
  const selectInputHandler = (name, value) => {
    if (name === 'jobSearchKey') {
      setJobSearchKey(value);
    }
  };

  /**
   * search 필터 함수
   * @param {string} value
   */
  const onJobSearch = (value) => {
    let jobListData = originJobListData;
    if (value !== '') {
      jobListData = jobListData.filter(
        (item) =>
          item[jobSearchKey.value] !== null &&
          item[jobSearchKey.value].includes(value),
      );
    }
    setJobKeyword(value);
    setJobListData(jobListData);
  };

  /**
   * 체크박스 선택
   *
   * @param {number} selectedId 선택된 ID
   */
  const onSelect = (selectedId) => {
    if (selectedRows.includes(selectedId)) {
      // 삭제
      setSelectedRows(selectedRows.filter((id) => id !== selectedId));
    } else {
      // 추가
      setSelectedRows(selectedRows.concat(selectedId));
    }
  };

  /**
   * 뒤로가기 (목록으로)
   */
  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (originJobListData.length > 0) {
      onJobSearch(jobKeyword || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSearchKey, jobKeyword, originJobListData]);

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      if (mounted.current) {
        mounted.current = false;
      }
    };
  }, []);

  useIntervalCall(getJobs, 1000);

  return (
    <JobContent
      wid={wid}
      tid={tid}
      jobListData={jobListData}
      loading={loading}
      totalJobRows={totalJobRows}
      selectedRows={selectedRows}
      jobSearchKey={jobSearchKey}
      jobKeyword={jobKeyword}
      trainingInfo={trainingInfo}
      toolInfo={toolInfo}
      onJobSearch={onJobSearch}
      onJobSearchKeyChange={(value) => {
        selectInputHandler('jobSearchKey', value);
      }}
      onCreateJob={onCreateJob}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      onSelect={onSelect}
      deleteBtnDisabled={selectedRows.length === 0}
      createBtnDisabled={createBtnDisabled}
      onViewJobLog={onViewJobLog}
      goBack={goBack}
      onStopJob={onStopJob}
      onStopJobs={onStopJobs}
      openCheckPointPopup={openCheckPointPopup}
    />
  );
}

export default UserJobPage;
