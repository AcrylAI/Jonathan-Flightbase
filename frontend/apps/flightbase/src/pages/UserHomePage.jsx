import { useState, useEffect, useCallback } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import UserHomeContent from '@src/components/pageContents/user/UserHomeContent';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';
import { startPath } from '@src/store/modules/breadCrumb';

// Custom Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { errorToastMessage } from '@src/utils';

function UserHomePage({ trackingEvent }) {
  const { t } = useTranslation();

  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const { id: wid } = match.params;

  // Redux hooks
  const dispatch = useDispatch();

  // State
  const [trainingItems, setTrainingItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [historyItem, setHistoryItem] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [storageData, setStorageData] = useState(null);
  const [gpuUsage, setGpuUsage] = useState([
    {
      used: '-',
      type: 'Training',
      total: '-',
    },
    {
      used: '-',
      type: 'Deployment',
      total: '-',
    },
  ]);

  const [info, setInfo] = useState({
    name: '-',
    description: '-',
    status: '-',
    users: [],
  });

  const [totalCount, setTotalCount] = useState([
    {
      variation: 0,
      total: '-',
      name: 'Docker Images',
    },
    {
      variation: 0,
      total: '-',
      name: 'Datasets',
    },
    {
      variation: 0,
      total: '-',
      name: 'Trainings',
    },
    {
      variation: 0,
      total: '-',
      name: 'Deployments',
    },
  ]); // totalCount

  /**
   * 워크스페이스 홈 데이터 가져오기
   *
   * @param {boolean} isFirst 처음 호출 여부
   * @param {boolean} isWUpdated 워크스페이스 변경 여부
   */
  const getHomeData = useCallback(
    async (isFirst) => {
      const response = await callApi({
        url: `dashboard/user?workspace_id=${wid}`,
        method: 'GET',
      });
      const { result, status, message, error } = response;

      if (status === STATUS_SUCCESS) {
        const {
          info,
          totalCount,
          usage,
          training_items: trainingItems,
          history,
          detailed_timeline,
          manager: isManager,
        } = result;

        if (isFirst) setTimeline(detailed_timeline);
        setHistoryItem(history);
        setInfo(info);
        setTotalCount(totalCount);
        if (usage) {
          setGpuUsage(usage.gpu);
        }
        setTrainingItems(trainingItems);
        setServerError(false);
        setIsManager(isManager);
      } else {
        errorToastMessage(error, message);
        setServerError(true);
      }
      return true;
    },
    [wid],
  );

  // storage 사용량 동기화
  const getStorageData = useCallback(async () => {
    const response = await callApi({
      url: `storage/${wid}/workspace`,
      method: 'PUT',
    });

    const { status, result, error, message } = response;

    if (status === STATUS_SUCCESS) {
      const newStorageData = {
        avail: result.workspace.workspace_avail,
        pcent: result.workspace.workspace_pcent,
        share: result.share,
      };
      if (result.share === 0) {
        // 할당형
        newStorageData.size = result.workspace.workspace_size;
        newStorageData.used = result.workspace.workspace_used;
      } else {
        // 공유형
        newStorageData.used = result.used;
        newStorageData.size = result.size;
        newStorageData.workspaceUsed = result.workspace.workspace_used;
      }

      setStorageData(newStorageData);
      return true;
    } else {
      errorToastMessage(error, message);
      setStorageData({
        used: 0,
        avail: 0,
        pcent: 0,
        size: 0,
        workspaceUsed: 0,
      });
      return false;
    }
  }, [wid]);

  /**
   * 페이지 바로가기
   *
   * @param {string} path (docker_images | datasets | trainings | deployments)
   */
  const directLink = (path) => {
    history.push(`/user/workspace/${wid}/${path}`);

    // Google Analytics
    let target = '';
    if (path === 'docker_images') {
      target = 'Docker Image';
    } else if (path === 'datasets') {
      target = 'Dataset';
    } else if (path === 'trainings') {
      target = 'Training';
    } else if (path === 'deployments') {
      target = 'Deployment';
    }
    if (target !== '') {
      trackingEvent({
        category: 'User Home Page',
        action: `Move To ${target} Page`,
      });
    }
  };

  /**
   * 최근 학습 현황에서 실제 JOB/HPS 목록으로 이동
   *
   * @param {number} trainingId 학습 ID
   * @param {string} trainingName 학습 이름
   * @param {string} itemType job or hps
   */
  const moveJobList = (trainingId, trainingName, itemType) => {
    history.push({
      pathname: `/user/workspace/${wid}/trainings/${trainingId}/workbench/${itemType}`,
      state: {
        id: trainingId,
        name: trainingName,
        loc: ['Home', trainingName, 'Workbench', itemType.toUpperCase()],
      },
    });
    trackingEvent({
      category: 'User Home Page',
      action: `Move To ${itemType.toUpperCase()} Page`,
    });
  };

  /**
   * 워크스페이스 설명 수정 모달 열기
   */
  const openWsDescEditModal = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_WS_DESC',
        modalData: {
          submit: {
            text: 'save.label',
            func: () => {
              dispatch(closeModal());
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          workspaceId: wid,
        },
      }),
    );
  };

  /**
   * 워크스페이스 GPU 수정 모달 열기
   */
  const openGPUSettingEditModal = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_GPU_SETTING',
        modalData: {
          submit: {
            text: 'save.label',
            func: () => {
              dispatch(closeModal());
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          workspaceId: wid,
        },
      }),
    );
  };

  const breadCrumbHandler = useCallback(() => {
    dispatch(
      startPath([
        {
          component: {
            name: 'Home',
            t,
          },
        },
      ]),
    );
  }, [dispatch, t]);

  useEffect(() => {
    breadCrumbHandler();
    getHomeData(true);
    getStorageData();
  }, [breadCrumbHandler, getHomeData, getStorageData]);

  useIntervalCall(getHomeData, 1000);

  return (
    <UserHomeContent
      trainingItems={trainingItems}
      totalCount={totalCount}
      directLink={directLink}
      moveJobList={moveJobList}
      gpuUsage={gpuUsage}
      history={historyItem}
      timeline={timeline}
      info={info}
      openWsDescEditModal={openWsDescEditModal}
      openGPUSettingEditModal={openGPUSettingEditModal}
      serverError={serverError}
      isManager={isManager}
      storageData={storageData}
    />
  );
}

export default UserHomePage;
