import { useState, useEffect, useCallback } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import HpsContent from '@src/components/pageContents/user/UserHpsContent';
import { toast } from '@src/components/Toast';

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

function UserHpsPage({ trackingEvent }) {
  const { t } = useTranslation();
  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const { id: wid, tid } = match.params;

  // Redux hooks
  const dispatch = useDispatch();

  // State
  const [originHpsListData, setOriginHpsListData] = useState([]);
  const [hpsListData, setHpsListData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [createBtnDisabled, setCreateBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalHpsRows, setTotalHpsRows] = useState(null);
  const [hpsSearchKey, setHpsSearchKey] = useState({
    label: 'hpsName.label',
    value: 'name',
  });
  const [hpsKeyword, setHpsKeyword] = useState('');
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
            component: { name: 'HPS' },
          },
        ]),
      );
    },
    [dispatch, wid, tid, t],
  );

  /**
   * API 호출 GET
   * HPS 데이터 가져오기
   */
  const getHps = useCallback(async () => {
    const response = await callApi({
      url: `trainings/hyperparam_search?training_id=${tid}`,
      method: 'GET',
    });
    const { status, result, message, error } = response;

    if (status === STATUS_SUCCESS) {
      const {
        list,
        total,
        status,
        training_info: trainingInfo,
        training_tool_info: toolInfo,
      } = result;

      breadCrumbHandler(trainingInfo?.training_name);
      setOriginHpsListData(list);

      if (hpsKeyword === '') {
        setHpsListData(list);
      }
      setTotalHpsRows(total);
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
  }, [breadCrumbHandler, hpsKeyword, tid]);

  /**
   * 실행 중인 HPS 중지
   *
   * @param {number} id HPS ID
   * @param {string} name HPS Group 이름
   * @param {number} index Group내 index
   */
  const onStopHps = async (id, name, index) => {
    trackingEvent({
      category: 'User HPS Page',
      action: 'Stop HPS',
    });
    const response = await callApi({
      url: `trainings/stop_hyperparam_search?hps_id=${id}`,
      method: 'GET',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      toast.success(`HPS ${index + 1} of '${name}' stop completed.`);
      getHps();
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 실행 중인 HPS 그룹 중지
   *
   * @param {*} id HPS 그룹 아이디
   * @param {*} name HPS 그룹 이름
   */
  const onStopHpsGroup = async (id, name) => {
    trackingEvent({
      category: 'User HPS Page',
      action: 'Stop HPS Group',
    });
    const response = await callApi({
      url: `trainings/stop_hyperparam_searchs?hps_group_id=${id}`,
      method: 'GET',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      toast.success(`HPS group '${name}' stop completed.`);
      getHps();
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * HPS 그룹 생성
   */
  const onCreateHPSGroup = () => {
    dispatch(
      openModal({
        modalType: 'CREATE_HPS_GROUP',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              getHps();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: { tid, wid },
        },
      }),
    );
    trackingEvent({
      category: 'User Job Page',
      action: 'Open Create HPS Group Modal',
    });
  };

  /**
   * HPS 그룹에 새로운 HPS 추가
   *
   * @param {number} groupId HPS 그룹 ID
   */
  const onAddHps = (groupId) => {
    dispatch(
      openModal({
        modalType: 'ADD_HPS',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              getHps();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: { tid, wid },
          groupId,
        },
      }),
    );
    trackingEvent({
      category: 'User Job Page',
      action: 'Open Create HPS Modal',
    });
  };

  /**
   * HPS 로그 모달 열기
   *
   * @param {object} data HPS 정보 및 로그 데이터
   * @param {string} hpsName HPS 이름
   */
  const onViewHpsLog = async (data, hpsName) => {
    dispatch(
      openModal({
        modalType: 'HPS_LOG',
        modalData: {
          submit: {
            text: 'confirm.label',
            func: () => {
              dispatch(closeModal('HPS_LOG'));
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          hpsId: data.id,
          hpsName,
          hpsData: data,
          trainingName: trainingInfo.name,
          trainingType: trainingInfo.type,
        },
      }),
    );
  };

  /**
   * API 호출 DELETE
   * HPS 삭제
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
      const groupToDelete = hpsListData.filter(
        (t) => t.group_id === groupId,
      )[0];
      const { hps_list: hpsList } = groupToDelete;
      body = { hps_id_list: hpsList.map((item) => item.id) };
      // 선택된 row 중 삭제될 그룹에 포함된 id를 제거합니다.
      remainRows = selectedRows.filter(
        (rowId) => hpsList.filter((item) => item.id === rowId).length <= 0,
      );
    } else {
      body = { hps_id_list: selectedRows };
      remainRows = [];
    }
    const response = await callApi({
      url: 'trainings/hyperparam_search',
      method: 'delete',
      body,
    });
    const { status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      getHps();
      setSelectedRows(remainRows);
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * HPS 삭제 확인 모달
   *
   * @param {number} groupId 그룹 ID
   */
  const openDeleteConfirmPopup = (groupId = undefined, isAll) => {
    trackingEvent({
      category: 'User HPS Page',
      action: 'Open Delete HPS Confirm Popup',
    });
    dispatch(
      openConfirm({
        title: isAll
          ? 'deleteAllHPSPopup.title.label'
          : 'deleteHPSPopup.title.label',
        content: 'deleteHPSPopup.message',
        notice: isAll ? t('deleteHPSPopup.notice.message') : '',
        confirmMessage: isAll ? t('deleteAll.label') : '',
        submit: {
          text: 'delete.label',
          func: () => {
            trackingEvent({
              category: 'User HPS Page',
              action: 'Delete HPS',
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
    if (name === 'hpsSearchKey') {
      setHpsSearchKey(value);
    }
  };

  /**
   * search 필터 함수
   * @param {string} value
   */
  const onHpsSearch = (value) => {
    let hpsListData = deepCopy(originHpsListData);
    if (value !== '') {
      hpsListData = hpsListData.filter(
        (item) =>
          item[hpsSearchKey.value] !== null &&
          item[hpsSearchKey.value].includes(value),
      );
    }

    setHpsKeyword(value);
    setHpsListData(hpsListData);
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
    if (originHpsListData.length > 0) {
      onHpsSearch(hpsKeyword || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hpsSearchKey, hpsKeyword, originHpsListData]);

  useEffect(() => {
    getHps();
  }, [getHps]);

  useIntervalCall(getHps, 1000);

  return (
    <HpsContent
      wid={wid}
      tid={tid}
      hpsListData={hpsListData}
      loading={loading}
      totalHpsRows={totalHpsRows}
      selectedRows={selectedRows}
      hpsSearchKey={hpsSearchKey}
      hpsKeyword={hpsKeyword}
      trainingInfo={trainingInfo}
      toolInfo={toolInfo}
      onHpsSearch={onHpsSearch}
      onHpsSearchKeyChange={(value) => {
        selectInputHandler('hpsSearchKey', value);
      }}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      onCreateHPSGroup={onCreateHPSGroup}
      onAddHps={onAddHps}
      onSelect={onSelect}
      deleteBtnDisabled={selectedRows.length === 0}
      createBtnDisabled={createBtnDisabled}
      onViewHpsLog={onViewHpsLog}
      goBack={goBack}
      onStopHps={onStopHps}
      onStopHpsGroup={onStopHpsGroup}
      openCheckPointPopup={openCheckPointPopup}
    />
  );
}

export default UserHpsPage;
