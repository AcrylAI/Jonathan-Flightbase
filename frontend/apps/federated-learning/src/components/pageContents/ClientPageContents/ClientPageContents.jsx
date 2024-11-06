import { useMemo, Fragment } from 'react';
import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// ui-react
import { Button, InputText, StatusCard } from '@jonathan/ui-react';

// Components
import Table from '@src/components/uiContents/Table';
import DropMenu from '@src/components/uiContents/DropMenu';
import BtnMenu from '@src/components/uiContents/DropMenu/BtnMenu';

// Icons
import RefreshIcon from '@images/icon/ic-refresh-blue.svg';
import MoreIcon from '@images/icon/ic-more.svg';

// utils
import { convertByte } from '@src/utils/utils';

// CSS Modules
import classNames from 'classnames/bind';
import style from './ClientPageContents.module.scss';
const cx = classNames.bind(style);

function ClientPageContents({
  tableData,
  isJoinRequest,
  tableLoading,
  onSync,
  onFilterDataTable,
  onReconnectClient,
  onDisconnectClient,
  onOpenDeleteClientModal,
  onOpenEditClientModal,
  onOpenJoinRequestsModal,
  onMoveToRoundDetailPage,
}) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  const tableColumns = useMemo(
    () => [
      {
        name: 'No.',
        maxWidth: '46px',
        selector: 'no',
        sortable: true,
      },
      {
        name: t('name.label'),
        minWidth: '113px',
        maxWidth: '146px',
        selector: 'name',
        sortable: true,
        allowOverflow: true,
        cell: ({ name }) => <div>{name}</div>,
      },
      {
        name: t('address.label'),
        minWidth: '189px',
        maxWidth: '209px',
        selector: 'address',
        sortable: true,
      },
      {
        name: t('connection.label'),
        minWidth: '125px',
        maxWidth: '133px',
        selector: 'connectionStatus',
        sortable: false,
        cell: ({ connectionStatus, connectionDateTime }) => {
          let text = t('disconnected.label');
          let status = 'disconnected';
          let tooltipText = `${connectionDateTime || ''}`;

          // 0 => disconnected, 1 => connected, 2 => error
          if (connectionStatus === 'disconnected') {
            tooltipText = `${t(
              'clients.table.disconnectedAt.message',
            )} ${tooltipText}`;
          } else if (connectionStatus === 'connected') {
            text = t('connected.label');
            status = 'connected';
            tooltipText = `${t(
              'clients.table.connectedAt.message',
            )} ${tooltipText}`;
          } else {
            text = t('error.label');
            status = 'error';
            tooltipText = `${t(
              'clients.table.occurredAt.message',
            )} ${tooltipText}`;
          }

          return (
            <div className={cx('status-card')}>
              <StatusCard
                text={text}
                theme={theme}
                status={status}
                customStyle={{
                  fontSize: '12px',
                }}
                isTooltip={true}
                tooltipData={{
                  description: tooltipText,
                }}
              />
            </div>
          );
        },
      },
      {
        name: t('spec.label'),
        minWidth: '230px',
        selector: 'spec',
        sortable: false,
        allowOverflow: true,
        cell: ({ spec }) => {
          const { cpu, memory, gpu } = spec;
          return (
            <>
              <span>
                CPU : {cpu}
                <br />
                Memory : {convertByte(memory)}
                {gpu.map((g, idx) => {
                  const {
                    gpu_count: gpuCnt,
                    gpu_name: gpuName,
                    gpu_memory_total: gpuMem,
                  } = g;
                  return (
                    <Fragment key={idx}>
                      <br />
                      GPU_{gpuCnt}
                      <br />- GPU {String(t('name.label')).toLowerCase()} :{' '}
                      {gpuName}
                      <br />- GPU Memory : {convertByte(gpuMem)}
                    </Fragment>
                  );
                })}
              </span>
            </>
          );
        },
      },
      {
        name: t('joined.label'),
        minWidth: '160px',
        maxWidth: '200px',
        selector: 'joinedDatetime',
        sortable: true,
        cell: ({ joinedDatetime }) => (
          <div>
            {joinedDatetime.split(' ')[0]}
            <span style={{ color: '#c2c2c2' }}>
              {' '}
              {joinedDatetime.split(' ')[1]}
            </span>
          </div>
        ),
      },
      {
        name: t('clients.table.latestParicipated.label'),
        minWidth: '133px',
        maxWidth: '153px',
        selector: 'latestParticipated',
        sortable: false,
        cell: ({
          lastestParticipated: {
            last_round_name: lastRoundName,
            last_round_group_name: roundGroupName,
          },
        }) => {
          return (
            <Button
              type='text-underline'
              theme={theme}
              onClick={() =>
                onMoveToRoundDetailPage(lastRoundName, roundGroupName)
              }
              customStyle={{ padding: 0 }}
            >
              {t('round.version.label', { version: lastRoundName })}
            </Button>
          );
        },
      },
      {
        name: '',
        minWidth: '56px',
        maxWidth: '56px',
        selector: 'info',
        sortable: false,
        allowOverflow: true,
        cell: ({ connectionStatus, name, address }) => {
          let action = '';
          let disable = false;
          let onClick = undefined;

          if (connectionStatus === 'connected') {
            action = t('disconnect.label');
            onClick = onDisconnectClient;
          } else if (connectionStatus === 'disconnected') {
            action = t('reconnect.label');
            onClick = onReconnectClient;
          } else {
            action = t('reconnect.label');
            disable = true;
          }

          const moreBtnList = [
            {
              name: t('editName.label'),
              onClick: () => {
                onOpenEditClientModal(name, address);
              },
            },
            {
              name: action,
              onClick: () => {
                if (onClick) onClick(address);
              },
              disable,
            },
            {
              name: t('delete.label'),
              customStyle: { color: '#de4747' },
              onClick: () => {
                onOpenDeleteClientModal(name, address);
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
      onDisconnectClient,
      onMoveToRoundDetailPage,
      onOpenDeleteClientModal,
      onOpenEditClientModal,
      onReconnectClient,
      t,
      theme,
    ],
  );

  return (
    <>
      <h1 className={cx('page-title')}>{t('clients.label')}</h1>
      <div className={cx('table-area')}>
        <div className={cx('table-header')}>
          <InputText
            theme={theme}
            customStyle={{
              width: '204px',
            }}
            closeIconStyle={{
              left: '172px',
              width: '20px',
              height: '20px',
              transform: 'translateY(-55%)',
            }}
            onChange={(e) => {
              onFilterDataTable(e.target.value);
            }}
            disableClearBtn={true}
            placeholder={t('table.search.label')}
          />
          <div className={cx('request-btn')}>
            {isJoinRequest && <div className={cx('request-mark')}></div>}
            <div className={cx('btn-group')}>
              <Button
                type='primary-reverse'
                customStyle={{
                  border: 'none',
                  color: '#5089f0',
                }}
                theme={theme}
                icon={RefreshIcon}
                iconAlign='left'
                onClick={onSync}
              >
                {t('sync.label')}
              </Button>
              <Button
                type='primary-reverse'
                customStyle={{
                  border: 'none',
                }}
                onClick={() => {
                  onOpenJoinRequestsModal();
                }}
                theme={theme}
              >
                {t('join.label')} {t('request.label')}
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={tableColumns}
          data={tableData}
          loading={tableLoading}
          emptyMessage={t('clients.table.noClientJoined.message')}
        />
      </div>
    </>
  );
}

export default ClientPageContents;
