import { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import _ from 'lodash';

import { StatusCard, Switch } from '@jonathan/ui-react';

import { Sypo, Table } from '@src/components/atoms';
import SortColumn from '@src/components/atoms/Table/TableHead/SortColumn';
import useSortColumn from '@src/components/atoms/Table/TableHead/useSortColumn';
import Tooltip from '@src/components/atoms/Tooltip/Tooltip';

import { LIME601, LIME603, MONO205, MONO206 } from '@src/utils/color';
import { ModelsTableColumnType } from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';

import { Exclamation, Memo } from '@src/static/images';

import styles from './ModelsPageContents.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  tableList: Array<ModelsTableColumnType>;
  total: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>;
  setSort: React.Dispatch<React.SetStateAction<string | undefined>>;
  setOrder: React.Dispatch<React.SetStateAction<string | undefined>>;
  onChangeActiveStatus: (row: ModelsTableColumnType) => void;
  resetFlag?: boolean;
  loading?: boolean;
};
function ModelsPageContents(props: Props) {
  const {
    tableList,
    total,
    setPage,
    setRowPerPage,
    setSort,
    setOrder,
    onChangeActiveStatus,
    resetFlag,
    loading,
  } = props;
  const { t } = useT();
  const [tableData, setTableData] =
    useState<Array<ModelsTableColumnType>>(tableList);
  const [onClickHandler] = useSortColumn(5);
  const [clickHeaderIdx, setClickHeaderIdx] = useState<number>(-1);

  const onChangeActive = (row: ModelsTableColumnType) => {
    const temp: Array<ModelsTableColumnType> = _.cloneDeep(tableData);
    const newData = temp.map((data) => {
      if (data.id === row.id) {
        return {
          ...data,
          status: !data.status,
        };
      }
      return {
        ...data,
      };
    });
    setTableData(newData);
    onChangeActiveStatus(row);
  };

  const columns: Array<TableColumn<ModelsTableColumnType>> = [
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.models.deploymentName')}
          idx={0}
        />
      ),
      maxWidth: '360px',
      minWidth: '200px',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            {row.description !== null && row.description !== '' ? (
              <div className={cx('deploy-title')}>
                <p>{row.deploymentName}</p>
                <Tooltip
                  icon={Memo}
                  direction='s'
                  desc={row.deploymentName}
                  offsetX={-40}
                >
                  <div className={cx('memo-text')}>{row.deploymentName}</div>
                </Tooltip>
              </div>
            ) : (
              <p>{row.deploymentName}</p>
            )}
          </div>
        );
      },
    },
    {
      name: t('page.models.model'),
      maxWidth: '360px',
      minWidth: '200px',
      cell: (row) => row.modelName,
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.models.deploymentOwner')}
          idx={1}
        />
      ),
      maxWidth: '240px',
      minWidth: '100px',
      sortable: true,
      cell: (row) => row.owner,
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.models.createdDate')}
          idx={2}
        />
      ),
      maxWidth: '240px',
      minWidth: '100px',
      sortable: true,
      cell: (row) => row.createdAt,
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.models.accessType')}
          idx={3}
        />
      ),
      maxWidth: '150px',
      minWidth: '100px',
      sortable: true,
      cell: (row) => {
        return (
          <>
            <div
              style={{ display: 'flex' }}
              className={cx(
                'accessStatus',
                row.access ? 'accessStatusPublic' : 'accessStatusPrivate',
              )}
            >
              {row.access ? (
                <Sypo color={LIME603} weight='medium' type='p2'>
                  {t('component.badge.public')}
                </Sypo>
              ) : (
                <Sypo color={MONO205} weight='medium' type='p2'>
                  {t('component.badge.private')}
                </Sypo>
              )}
              {row.access === 0 && (
                <Tooltip
                  direction='s'
                  desc={row.deploymentName}
                  offsetX={-40}
                  icon={Exclamation}
                >
                  <div className={cx('memo-text')}>
                    <Sypo color={MONO206} weight='bold' type='h4'>
                      {t(`page.models.accessableUser`)}
                    </Sypo>
                    <Sypo color={MONO206} weight='medium' type='p1'>
                      {row.userList?.split(',').join(', ')}
                    </Sypo>
                  </div>
                </Tooltip>
              )}
            </div>
          </>
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.models.active')}
          idx={4}
        />
      ),
      maxWidth: '150px',
      minWidth: '80px',
      sortable: true,
      cell: (row) => {
        if (row.active === 0) {
          return (
            <StatusCard
              status='disconnected'
              text={t('component.badge.inactive')}
              size='small'
              customStyle={{
                borderRadius: '2px',
              }}
            />
          );
        }
        return (
          <StatusCard
            status='broadcasting'
            text={t('component.badge.active')}
            size='small'
            customStyle={{
              borderRadius: '2px',
              backgroundColor: '#DEE9FF',
              color: '#2D76F8',
            }}
          />
        );
      },
    },
    {
      name: t('page.models.visible'),
      maxWidth: '60px',
      minWidth: '60px',
      cell: (row) => {
        return (
          <Switch checked={row.status} onChange={() => onChangeActive(row)} />
        );
      },
    },
  ];

  const onSortHandler = (
    selectedColumn: TableColumn<any>,
    sortDirection: SortOrder,
  ) => {
    let order = '';
    if (selectedColumn.id === 1) {
      order = 'deploymentName';
    } else if (selectedColumn.id === 3) {
      order = 'owner';
    } else if (selectedColumn.id === 4) {
      order = 'createdAt';
    } else if (selectedColumn.id === 5) {
      order = 'access';
    } else if (selectedColumn.id === 6) {
      order = 'active';
    }
    setOrder(order);
    setSort(sortDirection.toUpperCase());
    onClickHandler(clickHeaderIdx, sortDirection.toUpperCase());
  };

  useEffect(() => {
    setTableData(tableList);
  }, [tableList]);

  return (
    <div className={cx('container')}>
      <Table
        columns={columns}
        tableList={tableData}
        onSortHandler={onSortHandler}
        onChangePage={(page) => setPage(page)}
        paginationTotalRows={total}
        setRowPerPage={setRowPerPage}
        resetFlag={resetFlag}
        loading={loading}
      />
    </div>
  );
}

ModelsPageContents.defaultProps = {
  resetFlag: undefined,
  loading: undefined,
};
export default ModelsPageContents;
