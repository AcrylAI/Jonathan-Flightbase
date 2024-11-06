import React, { Children, useEffect } from 'react';
import DataTable, {
  ConditionalStyles,
  SortOrder,
  TableColumn,
  createTheme,
} from 'react-data-table-component';
import { ExpandableRowsComponent } from 'react-data-table-component/dist/src/DataTable/types';

import Spinner from '../Loader/Spinner/Spinner';

import './Table.scss';

createTheme(
  'jonathan',
  {
    selected: {
      default: 'rgba(45, 118, 248, 0.08)',
    },
    highlightOnHover: {
      default: 'rgba(45, 118, 248, 0.08)',
    }
  },
)

type Props<T> = {
  tableList: Array<T>;
  columns: Array<TableColumn<T>>;
  paginationTotalRows?: number;
  onChangePage(page: number): void;
  onSortHandler: (
    selectedColumn: TableColumn<T>,
    sortDirection: SortOrder,
    sortedRows: Array<T>,
  ) => void;
  setRowPerPage?: React.Dispatch<React.SetStateAction<number>>;
  expandableRowsComponent?: ExpandableRowsComponent<T>;
  expandableRows?: boolean;
  conditionalRowStyles?: Array<ConditionalStyles<T>>;
  resetFlag?: boolean;
  loading?: boolean;
  allSelected?: boolean;
  onRowClickedHandler?: (d: any, e: React.MouseEvent) => void;
  isDataPage?: boolean;
};

function Table<T>(props: Props<T>) {
  const {
    tableList,
    paginationTotalRows,
    onChangePage,
    onSortHandler,
    setRowPerPage,
    columns,
    expandableRowsComponent,
    expandableRows,
    conditionalRowStyles,
    resetFlag,
    loading,
    allSelected,
    onRowClickedHandler,
    isDataPage = false,
  } = props;

  const toLocaleString = () => {
    const deleteCommas = (str: string) => {
      return str.replace(/,/g, '');
    };
    const pagination = document.getElementsByClassName('rdt_Pagination');
    if (pagination && pagination.length > 0) {
      const childNode = pagination[0].children;
      if (childNode.length > 2) {
        const value = childNode[2].textContent;
        const splitData = value?.split(' ');
        if (splitData && splitData.length > 2) {
          const [startCount, endCount] = splitData[0]?.split('-');
          const localeString = Number(
            deleteCommas(splitData[2]),
          ).toLocaleString('kr');
          const result = `${`${Number(deleteCommas(startCount)).toLocaleString(
            'kr',
          )}-${Number(deleteCommas(endCount)).toLocaleString('kr')}`} ${
            splitData[1]
          } ${localeString}`;
          childNode[2].innerHTML = result;
        }
      }
    }
  };

  useEffect(() => {
    toLocaleString();
  }, []);

  const className = (() => {
    let output = 'dataTable';

    if (allSelected) output += ' active';
    if (isDataPage) output += ' _mk_datatable-view';

    return output;
  })();

  return (
    <DataTable
      className={
        className /* `dataTable ${allSelected && 'active'} ${isDataPage ?'_mk_datatable-view':''}` */
      }
      theme='jonathan'
      data={tableList}
      columns={columns}
      selectableRowsVisibleOnly
      pagination
      onChangePage={(page: number) => {
        onChangePage(page);
        toLocaleString();
      }}
      onRowClicked={onRowClickedHandler}
      paginationServer
      paginationRowsPerPageOptions={[10, 20, 30, 50, 100, 300]}
      paginationTotalRows={paginationTotalRows}
      onSort={(selectedColumn, sortDirection, sortedRows) =>
        onSortHandler(selectedColumn, sortDirection, sortedRows)
      }
      sortIcon={<></>}
      sortServer
      onChangeRowsPerPage={(rowPerPage: number) => {
        if (setRowPerPage) {
          setRowPerPage(rowPerPage);
          toLocaleString();
        }
      }}
      expandableRowsComponent={expandableRowsComponent}
      expandableRows={expandableRows}
      expandableRowsHideExpander
      expandOnRowClicked
      conditionalRowStyles={conditionalRowStyles}
      noDataComponent={<></>}
      persistTableHead
      paginationResetDefaultPage={resetFlag}
      progressPending={loading}
      highlightOnHover={true}
      progressComponent={
        <div className='spinnerArea'>
          <Spinner width={72} height={72} />
        </div>
      }
      fixedHeader
      fixedHeaderScrollHeight='531px'
    />
  );
}

Table.defaultProps = {
  paginationTotalRows: 10,
  setRowPerPage: undefined,
  expandableRowsComponent: [],
  conditionalRowStyles: undefined,
  expandableRows: false,
  resetFlag: undefined,
  loading: false,
  allSelected: undefined,
};

export default Table;
