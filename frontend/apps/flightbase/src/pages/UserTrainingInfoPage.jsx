import { useState, useCallback } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Custom Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';
import { startPath } from '@src/store/modules/breadCrumb';

// Components
import UserTrainingInfoContent from '@src/components/pageContents/user/UserTrainingInfoContent/UserTrainingInfoContent';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

function UserTrainingInfoPage() {
  const { t } = useTranslation();

  // Redux Hooks
  const dispatch = useDispatch();

  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const { id: wid, tid } = match.params;

  // State
  const [basicInfo, setBasicInfo] = useState({});
  const [builtInModelInfo, setBuiltInModelInfo] = useState({});
  const [accessInfo, setAccessInfo] = useState({});

  const onDelete = async (tid) => {
    const response = await callApi({
      url: `trainings/${tid}`,
      method: 'delete',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('delete');
      history.push(`/user/workspace/${wid}/trainings`);
    } else {
      errorToastMessage(error, message);
    }
  };

  // Events
  const openEditModal = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_TRAINING',
        modalData: {
          submit: {
            text: 'edit.label',
            func: () => {
              // refreshData();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          trainingId: tid,
          workspaceId: wid,
        },
      }),
    );
  };

  const openDeleteConfirmPopup = () => {
    dispatch(
      openConfirm({
        title: 'deleteTrainingPopup.title.label',
        content: 'deleteTrainingPopup.message',
        testid: 'training-delete-modal',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete(tid);
          },
        },
        cancel: {
          text: 'cancel.label',
        },
        confirmMessage: basicInfo.name,
      }),
    );
  };

  const allStop = async () => {
    const response = await callApi({
      url: `trainings/stop?training_id=${tid}`,
      method: 'get',
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('stop');
    } else {
      errorToastMessage(error, message);
    }
  };

  const getTrainingInfo = useCallback(async () => {
    const response = await callApi({
      url: `trainings/detail/${tid}`,
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setBasicInfo(result.basic_info);
      setBuiltInModelInfo(result?.built_in_model_info || {});
      setAccessInfo(result.access_info);
      breadCrumbHandler(result.basic_info.name);
      return true;
    }
    errorToastMessage(error, message);
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  useIntervalCall(getTrainingInfo, 1000);

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
            path: `/user/workspace/${wid}/trainings/${tid}/workbench`,
          },
        },
        {
          component: { name: 'Training Info', t },
        },
      ]),
    );
  };

  return (
    <UserTrainingInfoContent
      basicInfo={basicInfo}
      builtInModelInfo={builtInModelInfo}
      accessInfo={accessInfo}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      openEditModal={openEditModal}
      allStop={allStop}
    />
  );
}

export default UserTrainingInfoPage;
