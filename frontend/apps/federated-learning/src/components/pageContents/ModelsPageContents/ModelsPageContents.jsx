import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, InputText } from '@jonathan/ui-react';
import Table from '@src/components/uiContents/Table';
import DropMenu from '@src/components/uiContents/DropMenu';
import BtnMenu from '@src/components/uiContents/DropMenu/BtnMenu';

// Icons
import ExportIcon from '@images/icon/ic-export.svg';
import EditIcon from '@images/icon/ic-edit-gray.svg';

// Utils
import { capitalizeFirstLetter } from '@src/utils/utils';

// Store
import { openModal } from '@src/store/modules/modal';

// Types
import { MODAL_EDIT_MEMO, API_MODELS_PAGE_TABLE } from '@src/utils/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './ModelsPageContents.module.scss';
const cx = classNames.bind(style);

function ModelsPageContents({
  tableData,
  onFilterDataTable,
  onMoveToRoundDetailPage,
  onOpenBroadcastModelModal,
  requestEditMemo,
  requestDownloadModel,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [{ theme }, tableLoading] = useSelector(({ theme, httpRequest }) => [
    theme,
    httpRequest[API_MODELS_PAGE_TABLE]
      ? httpRequest[API_MODELS_PAGE_TABLE].loading
      : false,
  ]);

  const defaultColumns = useMemo(
    () => [
      {
        name: t('model.table.version.label'),
        maxWidth: '150px',
        minWidth: '150px',
        selector: 'round_name',
        sortable: false,
        cell: ({ round_name, round_group_name }) => {
          return (
            <Button
              type='text-underline'
              theme={theme}
              onClick={() =>
                onMoveToRoundDetailPage(round_name, round_group_name)
              }
              customStyle={{ padding: 0 }}
            >
              {t('round.version.label', { version: round_name })}
            </Button>
          );
        },
      },
      {
        name: t('model.table.created.label'),
        maxWidth: '200px',
        minWidth: '160px',
        selector: 'created',
        sortable: true,
        cell: ({ created }) => {
          if (created) {
            return (
              <div>
                {created.split(' ')[0]}
                <span style={{ color: '#c2c2c2' }}>
                  {` ${created.split(' ')[1]}`}
                </span>
              </div>
            );
          } else {
            return (
              <div>
                0000-00-00 <span style={{ color: '#c2c2c2' }}>00:00:00</span>
              </div>
            );
          }
        },
      },
      {
        name: t('model.table.memo.label'),
        minWidth: '400px',
        selector: 'description',
        sortable: false,
        cell: ({ description }) => <div>{description || '-'}</div>,
      },
      {
        name: t('model.table.editMemo.label'),
        Width: '80px',
        selector: 'description',
        sortable: false,
        button: true,
        cell: ({ round_name: version, description }) => (
          <img
            src={EditIcon}
            alt='edit icon'
            className='table-icon'
            onClick={() => {
              dispatch(
                openModal({
                  modalType: MODAL_EDIT_MEMO,
                  modalData: {
                    version,
                    memo: description,
                    onSubmit: (memo) => {
                      requestEditMemo(version, memo);
                    },
                  },
                }),
              );
            }}
          />
        ),
      },
      {
        name: t('model.table.export.label'),
        allowOverflow: true,
        button: true,
        width: '80px',
        cell: ({ round_name: version }) => {
          const exportBtnList = [
            {
              name: t('model.table.downloadModel.label'),
              onClick: () => {
                requestDownloadModel(version);
              },
            },
            {
              name: t('model.table.broadcast.label'),
              onClick: () => {
                onOpenBroadcastModelModal(version);
              },
            },
          ];
          return (
            <DropMenu
              btnRender={() => (
                <img
                  src={ExportIcon}
                  alt='Export icon'
                  className='table-icon'
                />
              )}
              menuRender={(popupHandler) => (
                <BtnMenu btnList={exportBtnList} callback={popupHandler} />
              )}
              align='RIGHT'
            />
          );
        },
      },
    ],
    [
      t,
      dispatch,
      theme,
      requestDownloadModel,
      onMoveToRoundDetailPage,
      onOpenBroadcastModelModal,
      requestEditMemo,
    ],
  );

  const [tableColumns, setTableColumns] = useState(defaultColumns);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const columnKeys = Object.keys(tableData[0].metrics);
      const resultColumns = columnKeys.map((key) => {
        return {
          name: capitalizeFirstLetter(key),
          minWidth: '100px',
          maxWidth: '220px',
          sortable: false,
          cell: ({ metrics }) => <div>{metrics[key]}</div>,
        };
      });
      defaultColumns.splice(2, 0, ...resultColumns);
      setTableColumns(defaultColumns);
    }
  }, [defaultColumns, tableData]);

  return (
    <>
      <h1 className={cx('page-title')}>{t('models.label')}</h1>
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
        <Table
          columns={tableColumns}
          data={tableData}
          loading={tableLoading}
          emptyMessage={t('model.table.empty.message')}
        />
      </div>
    </>
  );
}

export default ModelsPageContents;
