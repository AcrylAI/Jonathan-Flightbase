import { useEffect, useState, forwardRef } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import EmptyBox from '@src/components/molecules/EmptyBox';
import Loading from '@src/components/atoms/loading/Loading';
import DataTable, { createTheme } from 'react-data-table-component';

// @storybook
import { Selectbox, InputText } from '@jonathan/ui-react';

// table css
import './Table.scss';

const TmpComponent = () => <></>;

let renderCount = 0;

function Table({
  loading: tableLoading,
  columns,
  data,
  totalRows,
  selectableRows = true,
  selectableRowDisabled,
  selectboxPlaceholder,
  highlightOnHover = true,
  defaultSortField,
  filterList,
  finder,
  hideSearchBox = false,
  hideButtons = false,
  topButtonList,
  bottomButtonList,
  ExpandedComponent,
  searchOptions,
  searchKey,
  onSearchKeyChange,
  keyword,
  onSearch,
  onSelect,
  onClear,
  onRowClick,
  toggledClearRows = false,
  paginationResetDefaultPage = false,
  customPaginationComponent,
  conditionalRowStyles,
  fixedHeader = false,
  fixedHeaderScrollHeight,
  sortServer,
  paginationServer = false, // true: serverSide paging
  noDataMessage = 'noData.message',
  onChangeRowsPerPage = () => {},
  onChangePage = () => {},
  onChangeSort = () => {},
  onSortHandler = () => {},
}) {
  const { t } = useTranslation();
  const propsObj = {};
  if (customPaginationComponent)
    propsObj.paginationComponent = customPaginationComponent;
  if (conditionalRowStyles)
    propsObj.conditionalRowStyles = conditionalRowStyles;
  if (sortServer) {
    propsObj.sortServer = true;
    propsObj.onSort = onChangeSort;
  }
  if (fixedHeader) {
    propsObj.fixedHeader = true;
    propsObj.fixedHeaderScrollHeight = fixedHeaderScrollHeight;
  }
  const selectProps = {
    indeterminate: (isIndeterminate) => {
      return isIndeterminate.toString();
    },
  };

  // loading 적용
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    renderCount = 0;
  }, []);
  useEffect(() => {
    if (renderCount > 0) setLoading(false);
    else renderCount += 1;
  }, [data]);

  createTheme(
    'jonathan',
    {
      selected: {
        default: 'rgba(45,118,248, .08)',
      },
      highlightOnHover: {
        default: 'rgba(45,118,248, .08)',
      },
    },
    'default',
  );

  return (
    <div>
      {!hideSearchBox && (
        <div className='search-box'>
          {!hideButtons && topButtonList ? (
            <div className='btn-box'>{topButtonList}</div>
          ) : (
            <span></span>
          )}
          <div className='filter-search'>
            {filterList && <div className='filter'>{filterList}</div>}
            {(onSearch || keyword) && (
              <div className='search'>
                {searchKey && (
                  <Selectbox
                    list={searchOptions}
                    selectedItem={searchKey}
                    onChange={onSearchKeyChange}
                    customStyle={{
                      selectboxForm: {
                        width: '184px',
                        marginRight: '12px',
                      },
                      listForm: {
                        width: '184px',
                      },
                    }}
                    placeholder={selectboxPlaceholder}
                    t={t}
                  />
                )}
                <InputText
                  value={keyword}
                  type='medium'
                  placeholder={t('search.placeholder')}
                  leftIcon='/images/icon/ic-search.svg'
                  closeIcon='/images/icon/close-c.svg'
                  onChange={onSearch}
                  onClear={onClear}
                  customStyle={{ width: '184px' }}
                  disableLeftIcon={false}
                  disableClearBtn={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {finder && finder()}
      <DataTable
        className='datatable'
        columns={columns}
        data={data}
        theme='jonathan'
        allowOverflow
        noDataComponent={
          <EmptyBox customStyle={{ height: '120px' }} text={noDataMessage} />
        }
        defaultSortField={defaultSortField}
        defaultSortAsc={false}
        expandableRows={!!ExpandedComponent || !!onRowClick}
        expandableRowsHideExpander
        expandableRowsComponent={
          onRowClick ? (
            <TmpComponent />
          ) : !ExpandedComponent ? (
            <></>
          ) : (
            <ExpandedComponent />
          )
        }
        expandOnRowClicked
        progressComponent={<Loading />}
        progressPending={tableLoading !== undefined ? tableLoading : loading}
        pagination={!fixedHeader}
        paginationServer={paginationServer}
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onChangePage={onChangePage}
        highlightOnHover={highlightOnHover}
        pointerOnHover={!!ExpandedComponent}
        noContextMenu
        persistTableHead
        sortIcon={<></>}
        selectableRows={selectableRows}
        selectableRowsVisibleOnly
        selectableRowsHighlight
        selectableRowDisabled={selectableRowDisabled}
        selectableRowsComponent={forwardRef((props, ref) => {
          return (
            <label className='check-container'>
              <input ref={ref} {...props} />
              <span className='checkmark'></span>
            </label>
          );
        })}
        onSort={(selectedColumn, sortDirection, sortedRows) =>
          onSortHandler(selectedColumn, sortDirection, sortedRows)
        }
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30, 50, 100, 300]}
        selectableRowsComponentProps={selectProps}
        onSelectedRowsChange={onSelect}
        clearSelectedRows={toggledClearRows}
        onRowExpandToggled={(/*opt*/ _, row) => {
          if (onRowClick) onRowClick(row);
        }}
        paginationResetDefaultPage={paginationResetDefaultPage}
        {...propsObj}
      />
      {!hideButtons && bottomButtonList && (
        <div className='btn-box'>{bottomButtonList}</div>
      )}
    </div>
  );
}

export default Table;
