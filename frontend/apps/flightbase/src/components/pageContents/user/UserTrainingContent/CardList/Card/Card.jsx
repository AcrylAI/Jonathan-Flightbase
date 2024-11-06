import { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Components
import { Button, Tooltip } from '@jonathan/ui-react';
import DropMenu from '@src/components/molecules/DropMenu';
import BtnMenu from '@src/components/molecules/DropMenu/BtnMenu';
import JobStatusBar from './JobStatusBar';
import Workbench from './Workbench';
import Resource from './Resource';
import { toast } from '@src/components/Toast';

// Utils
import { errorToastMessage, defaultSuccessToastMessage } from '@src/utils';

// Network
import {
  callApi,
  STATUS_FAIL,
  STATUS_SUCCESS,
  STATUS_INTERNAL_SERVER_ERROR,
} from '@src/network';

// CSS Module
import classNames from 'classnames/bind';
import style from './Card.module.scss';
const cx = classNames.bind(style);

const IS_HIDE_JOB = import.meta.env.VITE_REACT_APP_IS_HIDE_JOB === 'true';
const IS_HIDE_HPS = import.meta.env.VITE_REACT_APP_IS_HIDE_HPS === 'true';

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

  // 컴포넌트 props
  const {
    id: trainingId,
    training_name: trainingName,
    user_name: creator,
    description,
    type, // 학습 타입
    built_in_model_name: builtInModelName,
    permission_level: permissionLevel,
    job_status: jobStatus,
    item_progress: latestItemStatus,
    status,
    training_tool_list: toolList,
    resource_info: resourceInfo,
    bookmark,
    access,
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
  const trainingStop = async () => {
    setStopLoading(true);
    const response = await callApi({
      url: `trainings/stop?training_id=${trainingId}`,
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
   * 학습 수정 모달 열기
   */
  const trainingEdit = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_TRAINING',
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
          workspaceId,
        },
      }),
    );
  };

  /**
   * API 호출 DELETE
   * 학습 삭제
   *
   * @param {number} tId 학습 ID
   */
  const onDelete = async (tId) => {
    const response = await callApi({
      url: `trainings/${tId}`,
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
   * 학습 삭제
   */
  const trainingDelete = () => {
    dispatch(
      openConfirm({
        title: 'deleteTrainingPopup.title.label',
        content: 'deleteTrainingPopup.message',
        testid: 'training-delete-modal',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete(trainingId);
          },
        },
        cancel: {
          text: 'cancel.label',
        },
        confirmMessage: trainingName,
      }),
    );
  };

  /**
   * 학습 카드 북마크 설정
   */
  const bookmarkHandler = () => {
    const body = { training_id: trainingId };
    const response = callApi({
      url: 'trainings/bookmark',
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
   * 학습 상세 페이지(workbench)로 이동
   */
  const moveToTrainingDetail = (e) => {
    e.stopPropagation();
    sessionStorage.setItem(
      `training/${workspaceId}_scroll_pos`,
      window.scrollY,
    );
    if (permissionLevel > 4) return;
    if (!e.target.closest('button') && !e.target.closest('.event-block')) {
      if (type === 'federated-learning') {
        // 연합 학습 페이지로 이동
        history.push(
          `/user/workspace/${workspaceId}/trainings/${trainingId}/federated-learning`,
        );
      } else {
        history.push(
          `/user/workspace/${workspaceId}/trainings/${trainingId}/workbench`,
        );
      }
    }
  };
  const isActive = status.status === 'running';

  // 학습 카드 컨텍스트 팝업에 들어갈 버튼 목록
  const btnList = [
    {
      name: t('stop.label'),
      iconPath: '/images/icon/00-ic-basic-stop-o-black.svg',
      onClick: trainingStop,
      disable:
        (status.status !== 'pending' && status.status !== 'running') ||
        permissionLevel > 4,
      testId: 'training-stop-btn',
    },
    {
      name: t('edit.label'),
      iconPath: '/images/icon/00-ic-basic-pen.svg',
      onClick: trainingEdit,
      testId: 'training-edit-btn',
      disable: permissionLevel > 3,
    },
    {
      name: t('delete.label'),
      iconPath: '/images/icon/00-ic-basic-delete.svg',
      onClick: trainingDelete,
      testId: 'training-delete-btn',
      disable: permissionLevel > 3,
    },
  ];

  return (
    <div
      className={cx('card', permissionLevel > 4 && 'disabled')}
      onClick={moveToTrainingDetail}
    >
      {permissionLevel > 4 && <div className={cx('dim')}></div>}
      <div className={cx('header')}>
        <div className={cx('training-type')}>
          <div
            className={cx(
              'active-status',
              isActive && 'active',
              stopLoading && 'stop',
              permissionLevel > 4 && 'not-allowed',
            )}
          >
            {type === 'built-in' || type === 'federated-learning' ? (
              <img
                className={cx('type-icon', 'built-in')}
                src='/images/icon/ic-built-in-blue.svg'
                alt='Built-in'
              />
            ) : (
              <img
                className={cx('type-icon', 'custom')}
                src='/images/icon/ic-custom-blue.svg'
                alt='Custom'
              />
            )}
          </div>
          {/* {type === 'built-in' && (
            <span className={cx('model-name')}>
              {builtInModelName || (
                <div className={cx('deleted')}>
                  <img
                    src='/images/icon/ic-warning-red.svg'
                    alt='Deleted Model'
                  />
                  <span>{t('modelDeleted.message')}</span>
                </div>
              )}
            </span>
          )} */}
          {type === 'federated-learning' && (
            <span className={cx('model-name')}>
              {t('federatedLearning.label')}
            </span>
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
      <div className={cx('training-info')}>
        <div className={cx('creator-auth')}>
          <span className={cx('creator')}>{creator}</span>
          {access === 0 && (
            <span className={cx('auth')}>
              <img src='/images/icon/00-ic-info-lock.svg' alt='private icon' />
            </span>
          )}
        </div>
        <div className={cx('training-name-box')}>
          <div className={cx('training-name')}>{trainingName}</div>
          {description && (
            <Tooltip
              contents={description}
              customStyle={{
                display: 'block',
                marginLeft: '4px',
                marginTop: '4px',
              }}
              contentsAlign={{
                horizontal: trainingName.length > 5 ? 'center' : 'left',
              }}
            >
              <img src='/images/icon/ic-description.svg' alt='description' />
            </Tooltip>
          )}
        </div>
      </div>
      {type !== 'federated-learning' && (
        <div className={cx('training-status')}>
          {/* {(!IS_HIDE_JOB || !IS_HIDE_HPS) && (
            <JobStatusBar
              trainingId={trainingId}
              trainingName={trainingName}
              jobStatus={jobStatus}
              latestItemStatus={latestItemStatus}
            />
          )} */}
          <div className={cx('btn-box')}>
            <Workbench toolList={toolList} />
            <Resource resourceInfo={resourceInfo} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;
