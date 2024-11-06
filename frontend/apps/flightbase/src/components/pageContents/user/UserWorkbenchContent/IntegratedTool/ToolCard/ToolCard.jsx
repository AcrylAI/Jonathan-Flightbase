import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Switch, Button, Tooltip } from '@jonathan/ui-react';
import DropMenu from '@src/components/molecules/DropMenu';
import BtnMenu from '@src/components/molecules/DropMenu/BtnMenu';
import { toast } from '@src/components/Toast';

// Modal Contents Component
import DockerImageFormModalHeader from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalHeader';
import DockerImageFormModalContent from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalContent';
import DockerImageFormModalFooter from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalFooter';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

// Utils
import { copyToClipboard, toCamelCase, errorToastMessage } from '@src/utils';

// Type
import { TRAINING_TOOL_TYPE } from '@src/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './ToolCard.module.scss';

const cx = classNames.bind(style);

function ToolCard({
  training_tool_id: id,
  tool_type: type,
  tool_type_name: typeName,
  tool_name: name,
  tool_status: toolStatus,
  toolReplicaNum,
  runEnvArr,
  runningInfoArr,
  functionInfoArr,
  deleteHandler,
  on_off_possible: isSwitchPossible,
  isHideExplanation,
  isPermission,
}) {
  const { t, i18n } = useTranslation();
  // Redux Hooks
  const dispatch = useDispatch();
  // Router Hooks
  const match = useRouteMatch();
  const { id: wid, tid } = match.params;

  const activeStatus = useMemo(
    () => ['running', 'pending', 'error', 'installing'],
    [],
  );
  const toolType = TRAINING_TOOL_TYPE[type]?.type || 'default';
  const toolLabel = TRAINING_TOOL_TYPE[type]?.label;
  const toolName = name || toolLabel || typeName || '';
  const [checked, setChecked] = useState(
    activeStatus.includes(toolStatus.status),
  );
  const [toolLoading, setToolLoading] = useState(false);
  const [toolLinkLoading, setToolLinkLoading] = useState(false);
  const [tabMenu, setTabMenu] = useState('env');
  const [isNameEditable, setIsNameEditable] = useState(false);

  const btnList = [
    {
      name: t('delete.label'),
      iconPath: '/images/icon/00-ic-basic-delete.svg',
      onClick: deleteHandler,
      disable: type === 0,
    },
  ];

  const toolHandler = async () => {
    setToolLoading(true);
    const response = await callApi({
      url: 'trainings/control_training_tool',
      method: 'put',
      body: {
        training_tool_id: id,
        action: checked ? 'off' : 'on',
      },
    });

    const { status: apiStatus, message, error } = response;

    setToolLoading(false);

    if (apiStatus === STATUS_SUCCESS) {
      toast.success(
        checked
          ? t('stopTool.message', { tool: toolName })
          : t('activateTool.message', { tool: toolName }),
      );
    } else if (apiStatus === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
    setChecked(!checked);
  };

  /**
   * 도구 비밀번호 변경 모달
   * 현재는 파일브라우저만 해당
   * @param {boolean} isReset 재설정 유무
   */
  const onPasswordChange = (isReset) => {
    dispatch(
      openModal({
        modalType: 'TOOL_PASSWORD_CHANGE',
        modalData: {
          submit: {
            text: isReset ? 'update.label' : 'create.label',
            func: () => {
              dispatch(closeModal('TOOL_PASSWORD_CHANGE'));
              if (!isReset) {
                moveToolLink();
              }
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          toolId: id,
          toolType: type,
          toolName,
          isReset,
        },
      }),
    );
  };

  /**
   * 비밀번호 재설정 버튼 클릭시 먼저 첫번째 입장인지 확인
   */
  const onCheckFilebrowserFirst = async () => {
    const response = await callApi({
      url: `trainings/filebrowser-first-entry?training_tool_id=${id}&protocol=${window.location.protocol.replace(
        ':',
        '',
      )}`,
      method: 'get',
    });
    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      if (result) {
        onPasswordChange(false);
      } else {
        onPasswordChange(true);
      }
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * Tool 새창에서 열기
   */
  const moveToolLink = async () => {
    setToolLinkLoading(true);
    const response = await callApi({
      url: `trainings/tool-url?training_tool_id=${id}&protocol=${window.location.protocol.replace(
        ':',
        '',
      )}`,
      method: 'get',
    });

    const { result, status: apiStatus, message, error } = response;
    setToolLinkLoading(false);
    if (apiStatus === STATUS_SUCCESS) {
      if (result.url !== '') {
        window.open(result.url, '_blank');
      } else {
        if (result?.need_password_change) {
          // 비밀번호 변경 필요
          onPasswordChange(false);
        }
      }
    } else if (apiStatus === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
  };

  /**
   * SSH 주소 복사
   */
  const copySSHAddress = async () => {
    const response = await callApi({
      url: `trainings/ssh_login_cmd?training_tool_id=${id}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      copyToClipboard(result);
      toast.success(result);
    } else {
      errorToastMessage(error, message);
    }
  };

  const onUpdate = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_TRAINING_TOOL',
        modalData: {
          submit: {
            text: t('edit.label'),
            func: () => {
              dispatch(closeModal('EDIT_TRAINING_TOOL'));
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          toolType: type,
          toolId: id,
          trainingId: tid,
          workspaceId: wid,
          toolReplicaNum,
          toolName,
        },
      }),
    );
  };

  /**
   * 도커이미지 커밋 모달
   */
  const onCommitDockerImage = () => {
    dispatch(
      openModal({
        modalType: 'CREATE_DOCKER_IMAGE',
        modalData: {
          headerRender: DockerImageFormModalHeader,
          contentRender: DockerImageFormModalContent,
          footerRender: DockerImageFormModalFooter,
          submit: {
            text: 'create.label',
            func: () => {
              dispatch(closeModal('CREATE_DOCKER_IMAGE'));
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          dockerImage: runningInfoArr[0].value,
          isCommit: true,
          workspaceId: wid,
          toolId: id,
        },
      }),
    );
  };

  /**
   * Tool 이름 편집 모드로 변경
   */
  const onEditName = () => {
    setIsNameEditable(true);
  };

  /**
   * Tool 이름 변경
   * @param {string} value 바뀐 이름
   */
  const onUpdateName = async (value) => {
    setIsNameEditable(false);
    if (toolName !== value) {
      const response = await callApi({
        url: 'trainings/tool/name',
        method: 'put',
        body: {
          training_tool_id: id,
          training_tool_name: value,
        },
      });

      const { status, message } = response;

      if (status === STATUS_SUCCESS) {
        toast.success(t('trainingToolChangeName.toast.message'));
      } else {
        toast.error(message);
      }
    }
  };

  /**
   * 작동 중 일때 작동 중 정보 표시
   */
  useEffect(() => {
    if (checked) {
      setTabMenu('info');
    } else {
      setTabMenu('env');
    }
  }, [checked]);

  const btnDisable = toolStatus.status !== 'running';
  useEffect(() => {
    setChecked(activeStatus.includes(toolStatus.status));
  }, [toolStatus, activeStatus]);

  return (
    <div className={cx('tool-card')}>
      <div className={cx('header')}>
        <div className={cx('left-box')}>
          <div className={cx('icon')}>
            {toolType === 'default' ? (
              toolName && (
                <div className={cx('initial')}>
                  {toolName.slice(0, 1).toUpperCase()}
                </div>
              )
            ) : (
              <img
                src={`/images/icon/ic-${toolType}.svg`}
                alt={`${toolType} icon`}
              />
            )}
          </div>
          {toolReplicaNum > 0 && (
            <div className={cx('tool-replica-number')}>
              {toolReplicaNum < 10 ? `0${toolReplicaNum}` : toolReplicaNum}
            </div>
          )}
        </div>
        <div className={cx('right-box')}>
          {toolStatus.status === 'error' && (
            <Tooltip
              title={toolStatus.reason}
              contents={
                <div className={cx('tooltip-contents')}>
                  <div className={cx('error-message')}>
                    <label>Message:</label>
                    {toolStatus.message || '-'}
                  </div>
                  <div className={cx('error-resolution')}>
                    <label>Resolution:</label>
                    {toolStatus.resolution || '-'}
                  </div>
                </div>
              }
              contentsAlign={{ horizontal: 'center' }}
              contentsCustomStyle={{
                maxWidth: '400px',
              }}
              children={
                <img
                  src='/images/icon/00-ic-alert-warning-yellow.svg'
                  alt='warning'
                  style={{ width: '24px', marginRight: '4px' }}
                />
              }
            />
          )}
          {isSwitchPossible && (
            <Switch
              size='x-large'
              checked={checked}
              message={toolStatus.reason}
              customStyle={
                toolLoading || toolStatus.status === 'installing'
                  ? { backgroundColor: '#ffab31' }
                  : toolStatus.status === 'error'
                  ? { backgroundColor: '#eb3e2a' }
                  : {}
              }
              onChange={toolHandler}
            />
          )}
        </div>
      </div>
      <div className={cx('name-box')}>
        <span
          className={cx('tool-name', isNameEditable && 'edit')}
          title={toolName}
          spellCheck='false'
          contentEditable='true'
          suppressContentEditableWarning='true'
          onFocus={() => {
            onEditName();
          }}
          onBlur={(e) => {
            onUpdateName(e.target.innerText);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
        >
          {toolName}
        </span>
        <div className={`${cx('popup-wrap')} event-block`}>
          <DropMenu
            btnRender={() => (
              <Button
                type='none-border'
                size='small'
                iconAlign='left'
                icon='/images/icon/00-ic-basic-ellipsis.svg'
                iconStyle={{ margin: '0', width: '24px', height: '24px' }}
                customStyle={{ width: '30px', padding: '6px' }}
              />
            )}
            menuRender={(popupHandler) => (
              <BtnMenu btnList={btnList} callback={popupHandler} />
            )}
            align='RIGHT'
          />
        </div>
      </div>
      {!isHideExplanation && (
        <div className={cx('explanation')}>
          {TRAINING_TOOL_TYPE[type]?.explanation[i18n.language]}
        </div>
      )}
      <div className={cx('content')}>
        <div className={cx('tab-menu')}>
          <div
            className={cx('menu-item', tabMenu === 'env' && 'selected')}
            onClick={() => setTabMenu('env')}
          >
            {t('runtimeOption.label')}
          </div>
          <div
            className={cx(
              'menu-item',
              tabMenu === 'info' && 'selected',
              btnDisable && 'disabled',
            )}
            onClick={() => !btnDisable && setTabMenu('info')}
          >
            {t('runningInfo.label')}
          </div>
        </div>
        {tabMenu === 'env' ? (
          <div className={cx('inner-box')}>
            <ul className={cx('list')}>
              <li className={cx('item')}>
                <div className={cx('edit-btn')} onClick={() => onUpdate()}>
                  <img src='/images/icon/ic-edit-blue.svg' alt='edit' />
                  {t('edit.label')}
                </div>
              </li>
              {runEnvArr.map(({ label, value, render }, key) => {
                const renderValue = (v) => {
                  if (v === null || v === undefined) {
                    return '-';
                  } else {
                    if (render) {
                      return render(v);
                    } else {
                      return typeof v !== 'object' ? v : 'object';
                    }
                  }
                };

                const result = renderValue(value);
                return (
                  <li className={cx('item')} key={key}>
                    <div className={cx('label')}>
                      {t(`${toCamelCase(label)}.label`)}
                    </div>
                    <div className={cx('value')}>{result}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className={cx('inner-box')}>
            <ul className={cx('list')}>
              <li className={cx('item')}>
                <div
                  className={cx('edit-btn', btnDisable && 'disabled')}
                  onClick={() =>
                    toolStatus.status === 'running' && onCommitDockerImage()
                  }
                >
                  <img src='/images/icon/ic-commit-blue.svg' alt='commit' />
                  {t('commitDockerImage.label')}
                </div>
              </li>
              {runningInfoArr.map(({ label, value, render }, key) => {
                const renderValue = (v) => {
                  if (v === null || v === undefined) {
                    return '-';
                  } else {
                    if (render) {
                      return render(v);
                    } else {
                      return typeof v !== 'object' ? v : 'object';
                    }
                  }
                };
                const result = renderValue(value);
                return (
                  <li className={cx('item')} key={key}>
                    <div className={cx('label')}>
                      {t(`${toCamelCase(label)}.label`)}
                    </div>
                    <div className={cx('value')}>{result}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div className={cx('footer')}>
        {toolType === 'filebrowser' && isPermission && (
          <Button
            type='primary'
            size='large'
            customStyle={{ fontSize: '14px', fontFamily: 'SpoqaR' }}
            onClick={onCheckFilebrowserFirst}
            disabled={btnDisable}
          >
            {t('resetPassword.label')}
          </Button>
        )}
        {functionInfoArr.map(({ type }, key) => {
          if (type === 'ssh') {
            return (
              <Button
                key={key}
                disabled={btnDisable}
                type='primary-light'
                size='large'
                icon={'/images/icon/00-ic-basic-copy-o-blue.svg'}
                iconAlign='right'
                customStyle={{ fontSize: '14px', fontFamily: 'SpoqaR' }}
                onClick={() => {
                  copySSHAddress(id);
                }}
              >
                SSH
              </Button>
            );
          } else if (type === 'link') {
            return (
              <Button
                key={key}
                disabled={btnDisable}
                type='primary-light'
                size='large'
                icon={'/images/icon/00-ic-basic-link-external-blue.svg'}
                iconAlign='right'
                customStyle={{ fontSize: '14px', fontFamily: 'SpoqaR' }}
                loading={toolLinkLoading}
                onClick={moveToolLink}
              >
                {toolLabel}
              </Button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default ToolCard;
