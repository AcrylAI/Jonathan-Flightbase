import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Components
import EmptyCaseContents from './EmptyCaseContents';
import RoundContents from './RoundContents';
import Table from '@src/components/uiContents/Table';
import DropMenu from '@src/components/uiContents/DropMenu';
import BtnMenu from '@src/components/uiContents/DropMenu/BtnMenu';
import { Button, InputText, StatusCard } from '@jonathan/ui-react';

// Icons
import MoreIcon from '@images/icon/ic-more.svg';
import SameArrowIcon from '@images/icon/ic-same-arrow.svg';
import LargeArrowIcon from '@images/icon/ic-large-arrow.svg';
import SmallArrowIcon from '@images/icon/ic-small-arrow.svg';

// Store
import { openModal, closeModal } from '@src/store/modules/modal';

// Types
import { MODAL_EDIT_ROUND_MEMO, MODAL_DELETE_ROUND } from '@src/utils/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './RoundPageContents.module.scss';
const cx = classNames.bind(style);

function RoundPageContents(RoundProps) {
  const {
    onFilterDataTable,
    onMoveToRoundDetailPage,
    onOpenRoundModal,
    onStopRoundModal,
    keyMetrics,
    tableData,
    stageData,
    currStatus,
    roundProgressCurrentCount,
    roundProgressTotalCount,
    descriptionHandler,
    t,
  } = RoundProps;
  const { theme } = useSelector((root) => root.theme);
  const [flowData, setFlowData] = useState(null);
  const [tableCellData, setTableCellData] = useState(null);
  const [roundName, setRoundName] = useState(null);
  const [roundGroupName, setRoundGroupName] = useState(null);

  const dispatch = useDispatch();

  const makeTableData = useCallback(() => {
    setTableCellData(tableData);
  }, [tableData]);

  const makeFlowData = useCallback(() => {
    if (stageData && stageData.round_name) {
      const trainingClient = stageData?.stage.training?.client_list;
      const broadcastClient = stageData?.stage.broadcasting?.client_list;
      const aggregation = stageData?.stage.aggregation;
      const dataObj = {};
      if (aggregation?.stage_status === 3 && aggregation?.stage_status_reason)
        dataObj.stageFailReason = aggregation.stage_status_reason;
      dataObj.trainingStageStatus = stageData?.stage.training.stage_status;
      dataObj.broadcastingStageStatus =
        stageData?.stage.broadcasting.stage_status;
      dataObj.aggregationStatus = aggregation?.stage_status;
      let dataArray = [];
      trainingClient?.forEach((data, index) => {
        let obj = {
          clientName: data.client_name,
          metrics: data.metrics,
          trainingStatus: data.training_status,
          testStatus: data.test_status,
          broadcastingStatus: broadcastClient[index].broadcasting_status,
        };
        dataArray.push(obj);
      });
      dataObj.data = dataArray;
      if (aggregation?.metrics) {
        let metricsArray = [];
        aggregation.metrics?.forEach((data) => {
          let obj = {};
          let key = Object.keys(data.metrics);
          obj.key = key[0];
          obj.value = data.metrics[key];
          obj.change_direction = data.change_direction;
          obj.change_amount = data.change_amount;
          metricsArray.push(obj);
        });
        dataObj.metrics = metricsArray;
      }
      setFlowData((flowData) => ({ ...flowData, dataObj }));
    }
  }, [stageData]);

  const makeRoundName = useCallback(() => {
    stageData?.round_name && setRoundName(stageData.round_name);
    stageData?.round_group_name &&
      setRoundGroupName(stageData.round_group_name);
  }, [stageData]);

  useEffect(() => {
    makeFlowData();
    makeRoundName();
  }, [makeFlowData, makeRoundName]);

  useEffect(() => {
    makeTableData();
  }, [makeTableData, tableData]);

  const columns = useMemo(
    () => [
      {
        name: t('round.label'),
        maxWidth: '145px',
        minWidth: '120px',
        selector: 'round_name',
        sortable: false,
        cell: ({ round_name, round_group_name }) => {
          return (
            <Button
              type='text-underline'
              theme={theme}
              onClick={() => {
                onMoveToRoundDetailPage(round_name, round_group_name);
              }}
              customStyle={{ padding: 0 }}
            >
              {t('round.version.label', { version: round_name })}
            </Button>
          );
        },
      },
      {
        name: t('round.table.status.label'),
        minWidth: '113px',
        maxWidth: '133px',
        selector: 'round_status',
        sortable: false,
        cell: ({ round_status, round_stage: stage }) => {
          let status = round_status;
          let statusText = status;
          if (status === 'active') {
            if (stage === 0) {
              status = 'idle';
              statusText = t('round.idleStage.label');
            } else if (stage === 1) {
              status = 'training';
              statusText = t('round.clientTrainingStage.label');
            } else if (stage === 2) {
              status = 'aggregation';
              statusText = t('round.aggregationStage.label');
            } else if (stage === 3) {
              status = 'broadcasting';
              statusText = t('round.broadcastingStage.label');
            }
          } else {
            if (status === 'fail') {
              status = 'failed';
              statusText = t('round.fail.label');
            } else if (status) statusText = t(`round.${status}.label`);
          }
          return (
            <StatusCard
              status={status}
              text={statusText}
              size='small'
              theme={theme}
              customStyle={{ width: 'max-content' }}
            />
          );
        },
      },
      {
        name: t('round.table.finished.label'),
        minWidth: '180px',
        maxWidth: '200px',
        selector: 'end_datetime',
        sortable: true,
        cell: ({ end_datetime }) =>
          end_datetime ? (
            <div>
              {end_datetime.split(' ')[0]}
              <span style={{ color: '#c2c2c2' }}>
                {' '}
                {end_datetime.split(' ')[1]}
              </span>
            </div>
          ) : (
            '-'
          ),
      },
      {
        name: t('round.table.clients.label'),
        minWidth: '113px',
        maxWidth: '130px',
        selector: 'number_of_joined_clients',
        sortable: false,
        cell: ({
          total_number_of_clients: total,
          number_of_joined_clients: joined,
        }) => <div>{t('outof.label', { part: joined, all: total })}</div>,
      },
      {
        name: t('round.table.seedModel.label'),
        maxWidth: '145px',
        minWidth: '120px',
        selector: 'seed_model_round_name',
        sortable: false,
        cell: ({ seed_model_round_name }) => (
          <div>
            {seed_model_round_name
              ? t('round.version.label', { version: seed_model_round_name })
              : '-'}
          </div>
        ),
      },
      {
        name: t('round.table.memo.label'),
        minWidth: '200px',
        selector: 'round_description',
        sortable: false,
        cell: ({ round_description }) => <div>{round_description || '-'}</div>,
      },
      {
        name: `${keyMetrics || ''}`,
        minWidth: '113px',
        sortable: false,
        cell: ({ metrics: data }) => {
          if (data) {
            const { metrics, change_direction, change_amount } = data;
            return (
              <div
                className={cx('metrics-column')}
                title={`Change amount: ${change_amount}`}
              >
                <span>{metrics[keyMetrics]}</span>
                {change_direction === 'higher' && (
                  <img src={LargeArrowIcon} alt='arrow icon' />
                )}
                {change_direction === 'same' && (
                  <img src={SameArrowIcon} alt='arrow icon' />
                )}
                {change_direction === 'lower' && (
                  <img src={SmallArrowIcon} alt='arrow icon' />
                )}
              </div>
            );
          } else {
            return <div>-</div>;
          }
        },
      },
      {
        allowOverflow: true,
        button: true,
        width: '56px',
        cell: (row) => {
          const {
            round_description: description,
            round_name: version,
            round_group_name: groupName,
            round_name: roundName,
          } = row;
          const moreBtnList = [
            {
              name: t('round.table.editMemo.label'),
              onClick: () => {
                dispatch(
                  openModal({
                    modalType: MODAL_EDIT_ROUND_MEMO,
                    modalData: {
                      version,
                      memo: description,
                      onSubmit: (memo) => {
                        descriptionHandler({
                          groupName,
                          roundName,
                          description: memo,
                        });
                        dispatch(closeModal(MODAL_EDIT_ROUND_MEMO));
                      },
                    },
                  }),
                );
              },
            },
            {
              name: t('round.table.delete.label'),
              customStyle: { color: '#de4747', hover: 'none' },
              disable: true,
              onClick: () => {
                dispatch(
                  openModal({
                    modalType: MODAL_DELETE_ROUND,
                    modalData: {
                      onCancel: () => {
                        dispatch(closeModal(MODAL_DELETE_ROUND));
                      },
                      onDelete: () => {
                        console.log('Delete');
                      },
                    },
                  }),
                );
              },
            },
          ];
          return (
            <DropMenu
              btnRender={() => (
                <img src={MoreIcon} alt='More icon' className='table-icon' />
              )}
              menuRender={(popupHandler) => (
                <BtnMenu btnList={moreBtnList} callback={popupHandler} />
              )}
              align='RIGHT'
            />
          );
        },
      },
    ],
    [
      t,
      keyMetrics,
      theme,
      onMoveToRoundDetailPage,
      dispatch,
      descriptionHandler,
    ],
  );

  return (
    <>
      <h1 className={cx('page-title')}>{t('rounds.label')}</h1>
      {stageData && stageData?.length !== 0 && (
        <>
          <RoundContents
            t={t}
            data={flowData}
            onOpenRoundModal={onOpenRoundModal}
            onStopRoundModal={onStopRoundModal}
            stageData={stageData}
            roundName={roundName}
            currStatus={currStatus}
            theme={theme}
            roundProgressCurrentCount={roundProgressCurrentCount}
            roundProgressTotalCount={roundProgressTotalCount}
            roundGroupName={roundGroupName}
          />
          <div className={cx('table-area')}>
            <div className={cx('table-header')}>
              <InputText
                theme={theme}
                customStyle={{
                  width: '204px',
                }}
                placeholder={t('table.search.label')}
                disableClearBtn={true}
                onChange={(e) => {
                  onFilterDataTable(e.target.value);
                }}
              />
            </div>
            {tableCellData && (
              <Table
                columns={columns}
                data={tableCellData}
                emptyMessage={t('round.table.empty.message')}
              />
            )}
          </div>
        </>
      )}
      {(stageData === undefined ||
        stageData === null ||
        (Array.isArray(stageData) && stageData.length === 0)) && (
        <EmptyCaseContents
          tableColum={columns}
          onOpenRoundModal={onOpenRoundModal}
        />
      )}
    </>
  );
}
export default RoundPageContents;
