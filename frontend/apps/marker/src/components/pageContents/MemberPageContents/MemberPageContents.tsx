import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import _ from 'lodash';

import { Button, StatusCard, Switch } from '@jonathan/ui-react';

import { Case, Switch as SwitchComponent } from '@jonathan/react-utils';
import { ClickAwayListener } from '@jonathan/react-utils';

import { Table } from '@src/components/atoms';
import SortColumn from '@src/components/atoms/Table/TableHead/SortColumn';
import useSortColumn from '@src/components/atoms/Table/TableHead/useSortColumn';
import Tooltip from '@src/components/atoms/Tooltip/Tooltip';

import { PageHeader } from '@src/components/molecules';

import LabelerCreateModal from '@src/components/organisms/Modal/LabelerCreateModal/LabelerCreateModal';
import LabelerEditModal from '@src/components/organisms/Modal/LabelerEditModal/LabelerEditModal';

import { MemberTableColumnType } from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import ExpandedRow from './ExpandedRow';
import MemberTypeToolTip from './MemberTypeToolTip';

import { CarrotGrayIcon, Edit, Memo } from '@src/static/images';

import styles from './MemberPageContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  tableList: Array<MemberTableColumnType>;
  total: number;
  reload: () => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>;
  setOrder: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSort: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onChangeActiveStatus: (row: MemberTableColumnType) => void;
  // onChangeSearch: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  setMemberType: React.Dispatch<React.SetStateAction<string | undefined>>;
  memberType: string | undefined;
  loading?: boolean;
  search?: string;
};

const MemberPageContents = (props: Props) => {
  const {
    tableList,
    total,
    reload,
    setPage,
    setRowPerPage,
    setOrder,
    setSort,
    setSearch,
    onChangeActiveStatus,
    // onChangeSearch,
    setMemberType,
    memberType,
    loading,
    search,
  } = props;
  const { t } = useT();
  const [tableData, setTableData] =
    useState<Array<MemberTableColumnType>>(tableList);
  const [onClickHandler] = useSortColumn(5);
  const [active, setActive] = useState<boolean>(false);
  const [clickHeaderIdx, setClickHeaderIdx] = useState<number>(-1);
  const modal = useModal();
  const onClickCreate = () => {
    modal.createModal({
      title: '라벨러 생성',
      content: <LabelerCreateModal refetch={reload} />,
    });
  };
  const onClickEdit = (
    e: React.MouseEvent<HTMLButtonElement>,
    data: MemberTableColumnType,
  ) => {
    e.stopPropagation();
    modal.createModal({
      title: '라벨러 수정',
      content: <LabelerEditModal refetch={reload} userData={data} />,
    });
  };

  const onClickManagerType = () => {
    setActive((prev) => !prev);
  };

  const onChangeSearch = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      setSearch(e.target.value);
    } else {
      setSearch('');
    }
  };

  const columns: Array<TableColumn<MemberTableColumnType>> = [
    {
      name: (
        <ClickAwayListener onClickAway={() => setActive(false)}>
          <div className={cx('managerType')}>
            <div
              onClick={onClickManagerType}
              className={cx('managerContainer', active && 'active')}
            >
              {t('page.members.memberType')}
              <img
                src={CarrotGrayIcon}
                alt='arrow'
                className={cx('arrowIcon')}
              />
            </div>
            <div className={cx('MemberTypeToolSection')}>
              <MemberTypeToolTip
                setMemberType={setMemberType}
                memberType={memberType}
                onClickType={onClickManagerType}
              />
            </div>
          </div>
        </ClickAwayListener>
      ),
      maxWidth: '136px',
      minWidth: '136px',
      cell: (row) => {
        return (
          <SwitchComponent>
            <Case condition={row.grade === 1}>
              <StatusCard
                status='running'
                text={t('component.badge.wsManager')}
                size='small'
                customStyle={{ borderRadius: '2px' }}
              />
            </Case>
            <Case condition={row.type === 1}>
              <StatusCard
                status='yellow'
                text={t('component.badge.labeler')}
                size='small'
                customStyle={{ borderRadius: '2px' }}
              />
            </Case>
            <Case condition={row.type === 2}>
              <StatusCard
                status='blue'
                text={t('component.badge.fbUser')}
                size='small'
                customStyle={{
                  borderRadius: '2px',
                  backgroundColor: '#DEE9FF',
                  color: '#2D76F8',
                }}
              />
            </Case>
          </SwitchComponent>
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t('page.members.id')}
          idx={0}
        />
      ),
      maxWidth: '270px',
      minWidth: '70px',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            {row.memo ? (
              <div className={cx('id-title')}>
                <p>{row.name}</p>
                <Tooltip
                  icon={Memo}
                  direction='s'
                  desc={row.memo}
                  offsetX={-40}
                >
                  <div className={cx('memo-text')}>{row.memo}</div>
                </Tooltip>
              </div>
            ) : (
              <p>{row.name}</p>
            )}
          </div>
        );
      },
    },
    {
      name: (
        <SortColumn
          title={t('page.members.participatingProjects')}
          onClickHandler={setClickHeaderIdx}
          idx={1}
        />
      ),
      maxWidth: '260px',
      minWidth: '50px',
      sortable: true,
      cell: (row) => row.participateProject,
    },
    {
      name: (
        <SortColumn
          title={t('page.members.monitoringProjects')}
          onClickHandler={setClickHeaderIdx}
          idx={2}
        />
      ),
      maxWidth: '260px',
      minWidth: '50px',
      sortable: true,
      cell: (row) => row.manageProject,
    },
    {
      name: (
        <SortColumn
          title={t('page.members.labelingData')}
          onClickHandler={setClickHeaderIdx}
          idx={3}
        />
      ),
      maxWidth: '260px',
      minWidth: '50px',
      sortable: true,
      cell: (row) => row.labelingData.toLocaleString('kr'),
    },
    {
      name: (
        <SortColumn
          title={t('page.members.reviewingData')}
          onClickHandler={setClickHeaderIdx}
          idx={4}
        />
      ),
      maxWidth: '260px',
      minWidth: '50px',
      sortable: true,
      cell: (row) => row.reviewData?.toLocaleString('kr'),
    },
    {
      name: t('page.members.edit'),
      maxWidth: '145px',
      minWidth: '30px',
      cell: (row) => {
        if (row.type === 1) {
          return (
            <Button
              type='none-border'
              theme='jp-primary'
              icon={Edit}
              customStyle={{ width: '7px', backgroundColor: 'transparent' }}
              onClick={(e) => onClickEdit(e, row)}
            />
          );
        }
        return <img src={Edit} alt='' style={{ filter: `opacity(50%)` }} />;
      },
    },
    {
      name: t('page.members.active'),
      maxWidth: '145px',
      minWidth: '30px',
      cell: (row) => {
        return (
          <Switch
            checked={row.status}
            disabled={row.type === 2 || row.grade === 1}
            onChange={() => onChangeActive(row)}
          />
        );
      },
    },
  ];

  const onChangeActive = (row: MemberTableColumnType) => {
    const temp = _.cloneDeep(tableData);
    const newData = temp.map((data: MemberTableColumnType) => {
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

  const onSortHandler = (
    selectedColumn: TableColumn<MemberTableColumnType>,
    sortDirection: SortOrder,
  ) => {
    let order = '';
    if (selectedColumn.id === 2) {
      order = 'name';
    } else if (selectedColumn.id === 3) {
      order = 'participateProject';
    } else if (selectedColumn.id === 4) {
      order = 'manageProject';
    } else if (selectedColumn.id === 5) {
      order = 'labelingData';
    } else if (selectedColumn.id === 6) {
      order = 'reviewData';
    }
    setOrder(order);
    setSort(sortDirection.toUpperCase());
    onClickHandler(clickHeaderIdx, sortDirection.toUpperCase());
  };

  const onChangePage = (page: number) => {
    setPage(page);
  };

  const ExpandedComponent = (column: { data: MemberTableColumnType }) => {
    if (typeof column.data.id === 'number') {
      return <ExpandedRow id={column.data.id} />;
    }
    return <></>;
  };

  useEffect(() => {
    setTableData(tableList);
  }, [tableList]);

  return (
    <div className={cx('container')}>
      <PageHeader
        leftSection='memberCount'
        rightSection='inputAndButton'
        color='blue'
        buttonText={t(`component.btn.createMember`)}
        pageTitle={t('component.lnb.members')}
        onClickAction={onClickCreate}
        memberCount={total}
        onChangeSearch={(e) => onChangeSearch(e)}
        value={search}
      ></PageHeader>
      <Table
        columns={columns}
        tableList={tableData}
        onSortHandler={onSortHandler}
        onChangePage={onChangePage}
        expandableRowsComponent={ExpandedComponent}
        expandableRows
        paginationTotalRows={total}
        setRowPerPage={setRowPerPage}
        loading={loading}
      />
    </div>
  );
};

MemberPageContents.defaultProps = {
  loading: false,
  search: '',
};
export default MemberPageContents;
