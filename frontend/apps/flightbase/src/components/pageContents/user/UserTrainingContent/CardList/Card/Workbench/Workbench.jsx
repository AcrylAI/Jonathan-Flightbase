import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { toast } from '@src/components/Toast';
import { Button } from '@jonathan/ui-react';
import DropMenu from '@src/components/molecules/DropMenu';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

// Utils
import { copyToClipboard, errorToastMessage } from '@src/utils';

// Type
import { TRAINING_TOOL_TYPE } from '@src/types';

// Icons
import WorkbenchIcon from '@src/static/images/icon/icon-workbench-blue.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './Workbench.module.scss';

const cx = classNames.bind(style);

function Workbench({ toolList }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);

  /**
   * SSH 접속 명령어 복사
   * @param {string} toolId 학습 툴 id
   */
  const copySSHAddress = async (toolId) => {
    const response = await callApi({
      url: `trainings/ssh_login_cmd?training_tool_id=${toolId}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      copyToClipboard(result);
      toast.success(result);
    } else if (status === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
  };

  /**
   * 도구 비밀번호 변경 모달
   * 현재는 파일브라우저만 해당
   */
  const onPasswordChange = (toolId, toolType, toolName) => {
    dispatch(
      openModal({
        modalType: 'TOOL_PASSWORD_CHANGE',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              dispatch(closeModal('TOOL_PASSWORD_CHANGE'));
              moveToolLink(toolId);
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          toolId,
          toolType,
          toolName,
          isReset: false,
        },
      }),
    );
  };

  /**
   * Tool 새창에서 열기
   * @param {string} toolId 학습 툴 id
   */
  const moveToolLink = async (toolId, toolType, toolName) => {
    const response = await callApi({
      url: `trainings/tool-url?training_tool_id=${toolId}&protocol=${window.location.protocol.replace(
        ':',
        '',
      )}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      if (result.url !== '') {
        window.open(result.url, '_blank');
      } else {
        if (result?.need_password_change) {
          // 비밀번호 변경 필요
          onPasswordChange(toolId, toolType, toolName);
        }
      }
    } else if (status === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (toolList.length > 0) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [toolList]);

  return (
    <div className={`${cx('workbench', !isActive && 'disabled')} event-block`}>
      <DropMenu
        customStyle={{ width: '100%' }}
        maxHeight={'230px'}
        menuRender={() =>
          isActive
            ? toolList.map(
                ({
                  tool_id: id,
                  tool_status: status,
                  tool_type: type,
                  tool_name: name,
                  tool_replica_number: replicaNumber,
                  function_info: functionInfoArr,
                }) => (
                  <div className={cx('tool-item')} key={id}>
                    <img
                      className={cx('tool-icon')}
                      src={`/images/icon/ic-${TRAINING_TOOL_TYPE[type].type}.svg`}
                      alt={TRAINING_TOOL_TYPE[type].type}
                    />
                    <div className={cx('tool-replica-number')}>
                      {replicaNumber === 0
                        ? '00'
                        : replicaNumber < 10
                        ? `0${replicaNumber}`
                        : replicaNumber}
                    </div>
                    <label
                      className={cx('tool-name')}
                      title={name || TRAINING_TOOL_TYPE[type].label}
                    >
                      {name || TRAINING_TOOL_TYPE[type].label}
                    </label>
                    <div className={cx('tool-btn')}>
                      {status && status.status !== 'running' ? (
                        <div className={cx('status', status.status)}>
                          {t(`${status.status}`)}
                        </div>
                      ) : (
                        functionInfoArr.map((value, key) => {
                          if (value === 'ssh') {
                            return (
                              <Button
                                key={key}
                                type='none-border'
                                size='small'
                                icon={'/images/icon/00-ic-basic-copy-o.svg'}
                                iconAlign='right'
                                customStyle={{
                                  width: 'auto',
                                  fontFamily: 'SpoqaR',
                                  padding: '0 6px',
                                }}
                                onClick={() => {
                                  copySSHAddress(id);
                                }}
                              >
                                SSH
                              </Button>
                            );
                          } else if (value === 'link') {
                            return (
                              <Button
                                key={key}
                                type='none-border'
                                size='small'
                                icon={
                                  '/images/icon/00-ic-basic-link-external.svg'
                                }
                                iconAlign='right'
                                customStyle={{
                                  width: 'auto',
                                  fontFamily: 'SpoqaR',
                                  padding: '0 6px',
                                }}
                                onClick={() => {
                                  moveToolLink(id, type, name);
                                }}
                              >
                                <span className={cx('btn-label')}>
                                  {name || TRAINING_TOOL_TYPE[type].label}
                                </span>
                              </Button>
                            );
                          }
                          return null;
                        })
                      )}
                    </div>
                  </div>
                ),
              )
            : []
        }
        btnRender={(isUp) => (
          <Button
            type='primary-light'
            icon={WorkbenchIcon}
            disabled={!isActive}
            customStyle={{
              width: '100%',
              backgroundColor: isUp
                ? '#c8dbfd'
                : isActive
                ? '#dee9ff'
                : '#f9fafb',
              borderColor: isUp ? '#c8dbfd' : isActive ? '#dee9ff' : '#f9fafb',
            }}
          >
            {t('workbench.label')}
          </Button>
        )}
        align='LEFT'
        isDropUp
        isScroll
      />
    </div>
  );
}

export default Workbench;
