import { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Custom hook
import useLocalStorage from '@src/hooks/useLocalStorage';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Molecules
import DropMenu from '@src/components/molecules/DropMenu';
import BtnMenu from '@src/components/molecules/DropMenu/BtnMenu';

// Components
import { toast } from '@src/components/Toast';
import { Button, Tooltip } from '@jonathan/ui-react';
import CallCountChart from './CallCountChart';
import WorkerStatus from './WorkerStatus';
import Api from './Api';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Network
import {
  callApi,
  STATUS_FAIL,
  STATUS_SUCCESS,
  STATUS_INTERNAL_SERVER_ERROR,
} from '@src/network';

// Icons
import WarningIcon from '@src/static/images/icon/ic-warning-red.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './Card.module.scss';
const cx = classNames.bind(style);

/**
 *
 * @component
 * @example
 *
 * return (
 *  <Card />
 * )
 */
function Card({ data, refreshData }) {
  const { t } = useTranslation();

  const setWorkerStatusInLocalStorage = useLocalStorage('worker_status')[1];

  // 컴포넌트 props
  const {
    id: deploymentId,
    deployment_name: deploymentName,
    user_name: creator,
    description,
    deployment_type: type, // 배포 타입
    built_in_model_name: builtInModelName,
    deployment_status: { status: deploymentStatus, worker },
    api_address: apiAddress,
    permission_level: permissionLevel,
    call_count_chart: CallCountChartData,
    bookmark,
    access,
    item_deleted,
  } = data;

  // 컴포넌트 State
  const [stopLoading, setStopLoading] = useState(false);
  // Redux Hooks
  const dispatch = useDispatch();
  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const { id: workspaceId } = match.params;
  /**
   * 자원 사용 중인 모든 액션 종료
   */
  const deploymentStop = async () => {
    setStopLoading(true);
    const response = await callApi({
      url: `deployments/stop?deployment_id=${deploymentId}`,
      method: 'get',
    });
    setStopLoading(false);
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('stop');
    } else if (status === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
  };

  /**
   * 배포 수정 모달 열기
   */
  const deploymentEdit = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_DEPLOYMENT',
        modalData: {
          submit: {
            text: 'edit.label',
            func: () => {
              refreshData();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data,
          deploymentId,
          workspaceId,
        },
      }),
    );
  };

  /**
   * API 호출 DELETE
   * 배포 삭제
   *
   * @param {number} deploymentId 배포 ID
   */
  const onDelete = async (deploymentId) => {
    const response = await callApi({
      url: `deployments/${deploymentId}`,
      method: 'delete',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      refreshData();
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 배포 삭제
   */
  const deploymentDelete = () => {
    dispatch(
      openConfirm({
        title: 'deleteDeploymentPopup.title.label',
        content: 'deleteDeploymentPopup.message',
        testid: 'deployment-delete-modal',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete(deploymentId);
          },
        },
        cancel: {
          text: 'cancel.label',
        },
        confirmMessage: deploymentName,
      }),
    );
  };

  /**
   * 배포 카드 북마크 설정
   */
  const bookmarkHandler = () => {
    const body = { deployment_id: deploymentId };
    const response = callApi({
      url: 'deployments/bookmark',
      method: bookmark === 0 ? 'post' : 'delete',
      body,
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      refreshData();
    } else if (status === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else if (status === STATUS_INTERNAL_SERVER_ERROR) {
      toast.error(message);
    }
  };

  /**
   * 배포 상세 페이지로 이동
   */
  const moveToDeploymentDetail = (e) => {
    e.stopPropagation();
    setWorkerStatusInLocalStorage('', true);
    sessionStorage.setItem(
      `deployment/${workspaceId}_scroll_pos`,
      window.scrollY,
    );
    if (permissionLevel > 4) return;
    if (!e.target.closest('button') && !e.target.closest('.event-block')) {
      if (worker.count === 0) {
        // 워커가 없을 때 워커 페이지로 이동
        history.push(
          `/user/workspace/${workspaceId}/deployments/${deploymentId}/workers`,
        );
      } else {
        // 워커가 있을 때 대시보드 페이지로 이동
        history.push(
          `/user/workspace/${workspaceId}/deployments/${deploymentId}/dashboard`,
        );
      }
    }
  };

  // 배포 카드 컨텍스트 팝업에 들어갈 버튼 목록
  const btnList = [
    {
      name: t('stop.label'),
      iconPath: '/images/icon/00-ic-basic-stop-o-black.svg',
      onClick: deploymentStop,
      disable:
        (deploymentStatus !== 'pending' && deploymentStatus !== 'running') ||
        permissionLevel > 4,
      testId: 'deployment-stop-btn',
    },
    {
      name: t('edit.label'),
      iconPath: '/images/icon/00-ic-basic-pen.svg',
      onClick: deploymentEdit,
      testId: 'deployment-edit-btn',
      disable: permissionLevel > 4,
    },
    {
      name: t('delete.label'),
      iconPath: '/images/icon/00-ic-basic-delete.svg',
      onClick: deploymentDelete,
      testId: 'deployment-delete-btn',
      disable: permissionLevel > 3,
    },
  ];

  return (
    <div
      className={cx('card', permissionLevel > 4 && 'disabled')}
      onClick={moveToDeploymentDetail}
    >
      {permissionLevel > 4 && <div className={cx('dim')}></div>}
      {deploymentStatus && (
        <div
          className={cx(
            'active-bar',
            deploymentStatus,
            stopLoading && 'loading',
          )}
        ></div>
      )}
      <div className={cx('header')}>
        <div className={cx('deployment-type')}>
          {type === 'built-in' ? (
            <>
              {item_deleted.length > 0 && (
                <span className={cx('tooltip-error')}>
                  <Tooltip
                    title={t('template.deployment.warning.Tooltip.message')}
                    contents={
                      <ul className={cx('tooltip-error-list')}>
                        {item_deleted.map((item, idx) => (
                          <li key={idx}>{t(item)}</li>
                        ))}
                      </ul>
                    }
                    contentsAlign={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    customStyle={{
                      position: 'relative',
                      display: 'block',
                    }}
                  >
                    <img src={WarningIcon} alt='error' />
                  </Tooltip>
                </span>
              )}
              {builtInModelName || t('deleteDeploymentModelInfo.label')}
            </>
          ) : (
            'Custom'
          )}
        </div>
        <div className={`${cx('popup-wrap')} event-block`}>
          <DropMenu
            btnRender={() => (
              <Button
                type='none-border'
                size='small'
                iconAlign='left'
                icon='/images/icon/00-ic-basic-ellipsis.svg'
                iconStyle={{ margin: '0', width: '24px', height: '24px' }}
                customStyle={{
                  width: '30px',
                  padding: '6px',
                }}
                testId='card-menu-btn'
              />
            )}
            menuRender={(popupHandler) => (
              <BtnMenu btnList={btnList} callback={popupHandler} />
            )}
            align='RIGHT'
          />
          {/* 북마크 */}
          <div
            className={cx('bookmark', bookmark === 1 && 'marked')}
            onClick={bookmarkHandler}
            name={t('bookmark.label')}
          ></div>
        </div>
      </div>
      <div className={cx('contents')}>
        <div>
          <div className={cx('deployment-info')}>
            <div className={cx('deployment-creator')}>
              <span className={cx('creator')}>{creator}</span>
              {access === 0 && (
                <span className={cx('auth')}>
                  <img
                    src='/images/icon/00-ic-info-lock.svg'
                    alt='private icon'
                  />
                </span>
              )}
            </div>
            <p className={cx('deployment-name')}>{deploymentName}</p>
            <p className={cx('deployment-desc')}>{description}</p>
          </div>
          <div className={`${cx('deployment-detail')} event-block`}>
            {worker.count > 0 && <WorkerStatus worker={worker} />}
            {apiAddress && <Api apiAddress={apiAddress} />}
          </div>
        </div>
        <CallCountChart data={CallCountChartData} />
      </div>
    </div>
  );
}

export default Card;
