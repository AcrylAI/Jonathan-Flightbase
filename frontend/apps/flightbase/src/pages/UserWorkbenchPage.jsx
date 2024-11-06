import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Custom Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// Components
import UserWorkbenchContent from '@src/components/pageContents/user/UserWorkbenchContent';
import PortInfo from '@src/components/pageContents/user/UserWorkbenchContent/IntegratedTool/ToolCard/PortInfo';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Store
import { startPath } from '@src/store/modules/breadCrumb';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

/**
 * 에디터
 * - (option) 포트포워딩
 *
 * jupyter
 * - 프토포워딩
 * - 도커이미지
 * - gpu model count
 *
 * job, hps
 * - 도커이미지
 * - gpu model count
 */

function UserWorkbenchPage() {
  // Router Hooks
  const match = useRouteMatch();
  const { id: wid, tid } = match.params;

  const { t } = useTranslation();

  // Redux Hooks
  const dispatch = useDispatch();

  // State
  const [trainingName, setTrainingName] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [queueToolList, setQueueToolList] = useState([]);
  const [integratedToolList, setIntegratedToolList] = useState([]);
  const [isHideExplanation, setIsHideExplanation] = useState(
    sessionStorage.getItem('isHideExplanation') === 'true',
  );
  const [stopLoading, setStopLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPermission, setIsPermission] = useState(false);

  const renderMap = useMemo(
    () => ({
      port_forwarding_info: (arr) => {
        return <PortInfo portList={arr} />;
      },
      gpu_model: (gpus = []) => {
        if (!gpus) return '-';
        return (
          <div>
            {gpus.map(({ model, node_list: nodeList }, key) => (
              <div key={key}>
                <div>{model}</div>
                <div>{nodeList.map((n) => n)}</div>
              </div>
            ))}
          </div>
        );
      },
      gpu_count: (count) => count,
    }),
    [],
  );

  const getToolList = useCallback(async () => {
    const response = await callApi({
      url: `trainings/tool?training_id=${tid}`,
      method: 'GET',
    });
    const { status, result } = response;

    if (status === STATUS_SUCCESS) {
      const queueToolList = result.queue_tool;
      const integratedToolList = result.integrated_tool.map((t) => {
        const {
          run_env: runEnv,
          running_info: runningInfo,
          function_info: functionInfoArr,
          tool_status: toolStatus,
        } = t;

        const runEnvArr = [];
        const runningInfoArr = [];

        runEnv.forEach((v) => {
          const label = Object.keys(v)[0];
          const value = Object.values(v)[0];
          runEnvArr.push({ label, value, render: renderMap[label] });
        });

        runningInfo.forEach((v) => {
          const label = Object.keys(v)[0];
          const value = Object.values(v)[0];
          runningInfoArr.push({ label, value, render: renderMap[label] });
        });

        if (toolStatus.status !== 'stop') {
          setIsActive(true);
        }

        return { ...t, runEnvArr, runningInfoArr, functionInfoArr };
      });

      setQueueToolList(queueToolList);
      setIntegratedToolList(integratedToolList);

      return true;
    }
    return false;
  }, [tid, renderMap]);

  /**
   * jupyter, ssh 삭제 핸들러
   * @param {number} id // tool id
   */
  const toolDeleteHandler = async (id) => {
    const response = await callApi({
      url: 'trainings/tool_replica',
      method: 'DELETE',
      body: {
        training_tool_id: id,
      },
    });
    const { status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 설명 표시 유무 변경
   */
  const showAndHideExplanation = () => {
    setIsHideExplanation(!isHideExplanation);
    sessionStorage.setItem('isHideExplanation', !isHideExplanation);
  };

  /**
   * Training Info 받기 위한 함수
   */
  const getTrainingInfo = useCallback(async () => {
    const response = await callApi({
      url: `trainings/detail/${tid}`,
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setTrainingType(result.basic_info.type);
      setTrainingName(result.basic_info.name);
      breadCrumbHandler(result.basic_info.name);
      setIsPermission(result.access_info.permission_level < 4);
    } else {
      errorToastMessage(error, message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  /**
   * 자원 사용 중인 모든 액션 종료
   */
  const onStopAllTool = async () => {
    setStopLoading(true);
    const response = await callApi({
      url: `trainings/stop?training_id=${tid}`,
      method: 'get',
    });
    setStopLoading(false);
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('stop');
    } else {
      errorToastMessage(error, message);
    }
  };

  const openCreateToolsModal = (type) => {
    dispatch(
      openModal({
        modalType: 'CREATE_TRAINING_TOOL',
        modalData: {
          submit: {
            text: t('create.label'),
            func: () => {
              dispatch(closeModal('CREATE_TRAINING_TOOL'));
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          trainingId: tid,
          toolType: type,
        },
      }),
    );
  };

  /**
   * Action 브래드크럼
   * @param {String} trainingName
   */
  const breadCrumbHandler = (trainingName) => {
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
          },
        },
        {
          component: { name: 'Workbench', t },
        },
      ]),
    );
  };

  useEffect(() => {
    getTrainingInfo();
  }, [getTrainingInfo]);

  useIntervalCall(getToolList, 1000);


  return (
    <UserWorkbenchContent
      trainingName={trainingName}
      trainingType={trainingType}
      queueToolList={queueToolList}
      integratedToolList={integratedToolList}
      isHideExplanation={isHideExplanation}
      showAndHideExplanation={showAndHideExplanation}
      toolDeleteHandler={toolDeleteHandler}
      stopLoading={stopLoading}
      isActive={isActive}
      onStopAllTool={onStopAllTool}
      openCreateToolsModal={openCreateToolsModal}
      isPermission={isPermission}
    />
  );
}

export default UserWorkbenchPage;
