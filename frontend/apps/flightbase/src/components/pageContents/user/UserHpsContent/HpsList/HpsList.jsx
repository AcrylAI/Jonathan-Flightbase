import { useState, useEffect } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Tooltip } from '@jonathan/ui-react';
import ContextMenu from '../ContextMenu';
import Status from '@src/components/atoms/Status';
import HpsListContent from '../HpsListContent';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';

// CSS module
import style from './HpsList.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const HpsList = ({
  data,
  trainingInfo,
  onCreate,
  openDeleteConfirmPopup,
  onSelect,
  onViewLog,
  selectedRows,
  onStopHps,
  onStopHpsGroup,
  // openCheckPointPopup,
  isAllOpen,
  manualOpenHandler,
  type,
}) => {
  const { t } = useTranslation();
  const { type: trainingType } = trainingInfo;
  const {
    name,
    group_id: groupId,
    status,
    status_counting: statusCount,
    docker_image_name: docker,
    dataset_name: dataset,
    create_datetime: createDatetime,
    creator,
    hps_list: hpsList,
    run_code: runCode,
  } = data;
  const { hyper_parameter: hyperParam, dataset_parameter: datasetParam } =
    data.static_parameter;
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const detailOpenHandler = () => {
    setIsOpen(!isOpen);
    manualOpenHandler(null);
  };

  useEffect(() => {
    if (isAllOpen) {
      setIsOpen(true);
    } else if (isAllOpen === false) {
      // null 값도 존재
      setIsOpen(false);
    }
  }, [isAllOpen]);

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
            <div className={cx('info-box')}>
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
              </div>
            </div>
            <div className={cx('static-params')}>
              <div className={cx('params-item', 'hyper-param')}>
                <label className={cx('label')}>
                  {t('hpsParameters.label')}
                </label>
                {hyperParam.length > 0
                  ? hyperParam.map(({ key, value }, idx) => {
                      return (
                        <div key={idx} className={cx('value')}>
                          <label className={cx('value', 'param')}>{key}</label>
                          <span className={cx('value')}>{value}</span>
                        </div>
                      );
                    })
                  : '-'}
              </div>
              <div className={cx('params-item', 'dataest-param')}>
                <label className={cx('label')}>
                  {t('datasetParameters.label')}
                  {type === 'built-in' && (
                    <Tooltip
                      contents={`${t(
                        'datasetParameters.label',
                      )} = /user_dataset/`}
                      contentsAlign={{ vertical: 'top', horizontal: 'center' }}
                    />
                  )}
                </label>
                {datasetParam.length > 0
                  ? datasetParam.map(({ key, value }, idx) => {
                      return (
                        <div key={idx} className={cx('value')}>
                          <label className={cx('value', 'param')}>{key}</label>
                          <span className={cx('value')}>{value}</span>
                        </div>
                      );
                    })
                  : '-'}
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
                status={status}
                contextMenuHandler={() => {
                  setIsMenuOpen(false);
                }}
                onCreate={() => onCreate(groupId)}
                onStop={() => onStopHpsGroup(groupId, name)}
                openDeleteConfirmPopup={() =>
                  openDeleteConfirmPopup(groupId, false)
                }
                // openCheckPointPopup={() => openCheckPointPopup(groupId)}
              />
            )}
          </div>
        </div>
        <div className={cx('second')}>
          <div className={cx('info-box', trainingType)}>
            <div>
              <label className={cx('label')}>{t('dockerImage.label')}</label>
              <span className={cx('value')} title={docker}>
                {docker || '-'}
              </span>
            </div>
            <div>
              <label className={cx('label')}>{t('dataset.label')}</label>
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
              <span className={cx('value', 'medium')} title={creator}>
                {creator}
              </span>
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
                status={status}
                contextMenuHandler={() => {
                  setIsMenuOpen(false);
                }}
                onCreate={() => onCreate(groupId)}
                onStop={() => onStopHpsGroup(groupId, name)}
                openDeleteConfirmPopup={() =>
                  openDeleteConfirmPopup(groupId, false)
                }
                // openCheckPointPopup={() => openCheckPointPopup(groupId)}
              />
            )}
          </div>
        </div>
      </div>
      {isOpen &&
        hpsList.map((list) => (
          <HpsListContent
            key={list.id}
            checked={
              selectedRows.filter((rowId) => rowId === list.id).length > 0
            }
            hpsName={name}
            data={list}
            onViewLog={onViewLog}
            onSelect={onSelect}
            onStopHps={() => {
              onStopHps(list.id, name, list.index);
            }}
          />
        ))}
    </div>
  );
};

export default HpsList;
