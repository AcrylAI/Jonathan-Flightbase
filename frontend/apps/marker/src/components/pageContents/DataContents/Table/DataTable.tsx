/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import {
  ConditionalStyles,
  SortOrder,
  TableColumn,
} from 'react-data-table-component';
import { useParams } from 'react-router-dom';

import { Checkbox } from '@jonathan/ui-react';

import { Case, Switch } from '@jonathan/react-utils';

import { Sypo, Table } from '@src/components/atoms';
import SortColumn from '@src/components/atoms/Table/TableHead/SortColumn';

import { BLUE104, LIME603, MONO205, ORANGE402, RED502 } from '@src/utils/color';
import { DataTableColumnType } from '@src/utils/types/data';

import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';

import {
  autoLabeling,
  DefaultImage,
  ImageError,
  TextFileThumbnail,
} from '@src/static/images';

import styles from './DataTable.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  tableList: Array<DataTableColumnType>;
  paginationTotalRows?: number;
  onChangePage(page: number): void;
  rowClickHandler: (row: DataTableColumnType) => void;
  rowSelectedStatus?: Set<number>;
  notDisableStatus?: Array<number>;
  selectAllHandler?: () => void | undefined;
  onSortHandler: (
    selectedColumn: TableColumn<DataTableColumnType>,
    sortDirection: SortOrder,
    sortedRows: Array<DataTableColumnType>,
  ) => void;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>;
  resetFlag: boolean;
  setClickHeaderIdx: React.Dispatch<React.SetStateAction<number>>;
  onRowClickedHandler?: (d: any, e: React.MouseEvent) => void;
  isDataPage?: boolean;
  allSelected?: boolean;
  dataType: number;
};

const DataTable = ({
  tableList,
  paginationTotalRows,
  onChangePage,
  allSelected,
  rowClickHandler,
  rowSelectedStatus,
  notDisableStatus,
  selectAllHandler,
  onSortHandler,
  setRowPerPage,
  resetFlag,
  setClickHeaderIdx,
  onRowClickedHandler,
  isDataPage = false,
  dataType,
}: Props) => {
  const params = useParams();
  const { t } = useT();
  const isOwner = useGetIsProjectOwner({ projectId: Number(params.pid) });
  const onErrorImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = ImageError;
  };

  const ownerColumns: Array<TableColumn<DataTableColumnType>> = [
    {
      name: (
        <div>
          <Checkbox onChange={selectAllHandler} checked={allSelected} />
        </div>
      ),
      maxWidth: '60px',
      minWidth: '50px',
      cell: (row: DataTableColumnType) => {
        return (
          <div>
            <Checkbox
              onChange={() => rowClickHandler(row)}
              checked={
                rowSelectedStatus && row.id
                  ? rowSelectedStatus.has(row.id)
                  : false
              }
              disabled={
                // (allSelected && row.workingStatus === 1) ||
                notDisableStatus &&
                notDisableStatus.length > 0 &&
                !notDisableStatus.includes(row.workingStatus as number)
              }
            />
          </div>
        );
      },
    },
    {
      name: t(`page.data.thumbnail`),
      maxWidth: '145px',
      selector: (row: DataTableColumnType) => row.thumbnail as string,
      minWidth: '120px',
      cell: (row: DataTableColumnType) => {
        return (
          <img
            style={{ height: '32px', width: '32px' }}
            src={
              dataType === 1
                ? TextFileThumbnail
                : row.thumbnail
                ? row.thumbnail
                : DefaultImage
            }
            alt='thumbnail'
            onError={onErrorImage}
          />
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t(`page.data.filename`)}
          idx={0}
        />
      ),
      maxWidth: '400px',
      minWidth: '170px',
      selector: (row: DataTableColumnType) => row.fileName as string,
      sortable: true,
      conditionalCellStyles: [
        {
          when: () => true,
          classNames: [cx('file_name')],
        },
      ],
    },
    // {
    //   name: '동기화 상태',
    //   maxWidth: '145px',
    //   minWidth: '120px',
    //   selector: (row: DataTableColumnType) => row.sync as number,
    //   sortable: true,
    //   cell: (row) => {
    //     return row.sync ? (
    //       <div>
    //         <img className={cx('syncFalseIcon')} src={syncStatusFalse} alt='' />
    //         <div className={cx('syncTooltip')}>
    //           <img src={CautionInfo} alt='' />
    //           <p>연결된 폴더에서 데이터를 찾을 수 없습니다.</p>
    //         </div>
    //       </div>
    //     ) : (
    //       <img src={syncStatusTrue} alt='' />
    //     );
    //   },
    // },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t(`page.data.lastUpdated`)}
          idx={1}
        />
      ),
      maxWidth: '270px',
      minWidth: '120px',
      selector: (row) => row.updatedAt as string,
      sortable: true,
    },
    {
      name: (
        <SortColumn
          title={t(`page.data.labeler`)}
          idx={2}
          onClickHandler={setClickHeaderIdx}
        />
      ),
      maxWidth: '200px',
      minWidth: '120px',
      selector: (row) => row.labeler as string,
      sortable: true,
    },
    {
      name: (
        <SortColumn
          title={t(`page.data.reviewer`)}
          idx={3}
          onClickHandler={setClickHeaderIdx}
        />
      ),
      maxWidth: '200px',
      minWidth: '120px',
      selector: (row) => row.review as string,
      sortable: true,
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t(`page.data.autolabeling`)}
          idx={4}
        />
      ),
      maxWidth: '170px',
      minWidth: '120px',
      selector: (row: DataTableColumnType) => row.autoLabeling as number,
      sortable: true,
      cell: (row: DataTableColumnType) => {
        return row.autoLabeling ? <img src={autoLabeling} alt='' /> : <p>-</p>;
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={setClickHeaderIdx}
          title={t(`page.data.workStatus`)}
          idx={5}
        />
      ),
      maxWidth: '170px',
      minWidth: '120px',
      selector: (row) => row.workingStatus as number,
      sortable: true,
      cell: (row) => (
        <Switch>
          <Case condition={row.workingStatus === 0}>
            <div className={cx('notAssigned')}>
              <Sypo color={MONO205} type='P2'>
                {t(`page.data.notAssigned`)}
              </Sypo>
            </div>
          </Case>
          <Case condition={row.workingStatus === 1}>
            <div className={cx('completed')}>
              <Sypo color={LIME603} type='P2'>
                {t(`component.badge.completed`)}
              </Sypo>
            </div>
          </Case>
          <Case condition={row.workingStatus === 2}>
            <div className={cx('labeling')}>
              <Sypo color={BLUE104} type='P2'>
                {t(`component.badge.labelingInProgress`)}
              </Sypo>
            </div>
          </Case>
          <Case condition={row.workingStatus === 3}>
            <div className={cx('reviewInProgress')}>
              <Sypo color={ORANGE402} type='P2'>
                {t(`component.badge.reviewInProgress`)}
              </Sypo>
            </div>
          </Case>
          <Case condition={row.workingStatus === 4}>
            <div className={cx('rejected')}>
              <Sypo color={RED502} type='P2'>
                {t(`component.badge.rejected`)}
              </Sypo>
            </div>
          </Case>
        </Switch>
      ),
    },
  ];
  const guestColumns = ownerColumns.filter((_, idx) => idx !== 0);

  // row 선택 했을 떄 스타일
  const conditionalRowStyles: ConditionalStyles<DataTableColumnType>[] =
    useMemo(
      () => [
        {
          when: (row) => {
            return !!rowSelectedStatus?.has(row.id as number);
          },
          style: {
            backgroundColor: '#EAF1FE',
          },
          classNames: [],
        },
      ],
      [rowSelectedStatus],
    );

  return (
    <Table
      allSelected={allSelected}
      tableList={tableList}
      paginationTotalRows={paginationTotalRows}
      onChangePage={onChangePage}
      onSortHandler={onSortHandler}
      setRowPerPage={setRowPerPage}
      columns={isOwner ? ownerColumns : guestColumns}
      conditionalRowStyles={conditionalRowStyles}
      resetFlag={resetFlag}
      onRowClickedHandler={onRowClickedHandler}
      isDataPage={isDataPage}
    />
  );
};

DataTable.defaultProps = {
  paginationTotalRows: 0,
  allSelected: false,
  rowSelectedStatus: undefined,
  notDisableStatus: undefined,
  selectAllHandler: undefined,
  onRowClickedHandler: () => {},
  isDataPage: undefined,
};

export default DataTable;
