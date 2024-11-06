import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import _, { debounce } from 'lodash';

import { Button, InputText } from '@jonathan/ui-react';

import {
  AssignModalAtom,
  AssignModalAtomModel,
} from '@src/stores/components/Modal/AssignModalAtom';

import {
  APIProps,
  LabelerDataType,
  ReviewerDataType,
} from '@src/pages/DataPage/DataPage';

import { Sypo } from '@src/components/atoms';
import useSortColumn from '@src/components/atoms/Table/TableHead/useSortColumn';

import { toast } from '@src/components/molecules/Toast';

import AssignModal from '@src/components/organisms/Modal/AssignModal/AssignModal';
import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';
import CancelApprovalModal from '@src/components/organisms/Modal/CancelAssignModal/CancelApprovalModal';
import CancelAssignModal from '@src/components/organisms/Modal/CancelAssignModal/CancelAssignModal';

import { MONO202, MONO205, RED502, YELLOW304 } from '@src/utils/color';
import { DataTableColumnType, FilterDataType } from '@src/utils/types/data';

import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useTransfer from '@src/hooks/Common/useTransfer';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import AppliedFilter from './Filter/AppliedFilter';
import Filter from './Filter/Filter';
import Header from './Header/Header';
import ProgressBar from './ProgressBar/ProgressBar';
import DataTable from './Table/DataTable';
import TableHeader from './Table/TableHeaderExpand';

import { FilterIcon, InactiveFilterIcon } from '@src/static/images';
import { EmptyFile } from '@src/static/images';

import styles from './DataContents.module.scss';
import classNames from 'classnames/bind';

import type { HttpResponseType } from '@src/network/api/types';
const cx = classNames.bind(styles);

type Props = {
  data: HttpResponseType;
  callTableAPI: ({
    page,
    keyword,
    order,
    sort,
    condition,
    filter,
    limit,
  }: APIProps) => Promise<HttpResponseType>;
  filteredData: Array<FilterDataType>;
  setFilteredData: React.Dispatch<React.SetStateAction<FilterDataType[]>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;
  filterCondition: number;
  setFilterCondition: React.Dispatch<React.SetStateAction<number>>;
  rowPerPage: number;
  setRowPerPage: React.Dispatch<React.SetStateAction<number>>;
  progressData: number;
  dataStatus: number;
  filterButtonState: boolean;
  reviewerData: Array<ReviewerDataType>;
  labelerData: Array<LabelerDataType>;
  cancelHandler: () => void;
  filterButtonDisable: boolean;
  cancelFilterHandler: () => void;
  onChangeSearch: (e?: React.ChangeEvent<HTMLInputElement>) => void;
};
const NO_ASSIGN = [0];
const WORKING = [1, 2, 3, 4, 5, 6];
const CANCEL_STATUS = [2, 3, 4, 5, 6];
const COMPLETE = [1];

const DataContents = (props: Props) => {
  const {
    data,
    callTableAPI,
    filteredData,
    setFilteredData,
    page,
    setPage,
    order,
    setOrder,
    sort,
    setSort,
    filterCondition,
    setFilterCondition,
    rowPerPage,
    setRowPerPage,
    progressData,
    dataStatus,
    filterButtonState,
    reviewerData,
    labelerData,
    cancelHandler,
    filterButtonDisable,
    cancelFilterHandler,
    onChangeSearch,
  } = props;
  const {
    connected,
    notAssigned,
    working,
    complete,
    list,
    total,
    currentNotAssigned,
    currentWorking,
  } = data.result;
  const { t } = useT();
  const lang = window.localStorage.getItem('language');
  const [tableList, setTableList] = useState<Array<DataTableColumnType>>(list);
  const tableHeadExpand = useRef<any>(new TableHeader());
  const [allSelected, setAllSelected] = useState<boolean | undefined>(false);
  const [rowSelectedStatus, setRowSelectedStatus] = useState<Set<number>>(
    new Set(),
  );
  const [rangeButton, setRangeButton] = useState<number | undefined>(undefined);
  const [statusButton, setStatusButton] = useState<number | undefined>(
    undefined,
  );
  const [notDisableStatus, setNotDisableStatus] = useState<
    Array<number> | undefined
  >([]);
  const [selectedRowCount, setSelectedRowCount] = useState<number>(0);
  const [noSelectedRowId, setNoSelectedRowId] = useState<Set<number>>(
    new Set(),
  );
  const [assignButtonStatus, setAssignButtonStatus] = useState<boolean>(true);
  const [cancelButtonStatus, setCancelButtonStatus] = useState<boolean>(true);
  const [revokeButtonStatus, setRevokeButtonStatus] = useState<boolean>(true);
  const [selectedRow, setSelectedRow] = useState<Map<number, number>>(
    new Map(),
  );
  const [resetFlag, setResetFlag] = useState<boolean>(false);
  const [clickHeaderIdx, setClickHeaderIdx] = useState<number>(-1);
  const [onClickHandler] = useSortColumn(6);
  const [filterCancelStatus, setFilterCancelStatus] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const bntRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  // assign modal atom
  const [assignModalState, setAssignModalState] =
    useRecoilState<AssignModalAtomModel>(AssignModalAtom);
  const params = useParams();
  const { data: metaData } = useGetProjectMetaData({
    projectId: Number(params.pid),
  });
  const { moveToJob } = useTransfer();

  const modal = useModal();
  const isOwner = useGetIsProjectOwner({ projectId: Number(params.pid) });
  const createAssignModal = () => {
    const projectId = Number(params.pid);

    if (Number.isNaN(projectId) || metaData?.result === undefined) {
      toast.api.badRequest();
      return;
    }
    /*
    console.log('SelectedRow-', rowSelectedStatus); // 선택된 row
    console.log('noSelect-', noSelectedRowId); // 선텍 해지된 row id
    console.log('range-', rangeButton); // 2-> 이 페이지 1-> 전체 페이지
    console.log('selectCount', selectedRowCount); // 선택된 row 수
    console.log('filter', filteredData); // 필터링 정보 
    */
    const temp = _.cloneDeep(assignModalState);
    temp.maxLabelCnt = selectedRowCount;
    temp.maxReviewCnt = selectedRowCount;
    temp.projectId = projectId;
    temp.hasReview = metaData.result.workflow === 1;
    temp.assignId = [...rowSelectedStatus];
    temp.notAssignId = [...noSelectedRowId];
    temp.filter = filteredData;
    // 2와 1이 변경됨
    // 후에 리펙토링 demian
    temp.flag = rangeButton === 1 ? 2 : 1 ?? 2;
    setAssignModalState(temp);

    const callApi = async () => {
      setResetFlag(false);
      await callTableAPI({
        page: 1,
        order,
        sort,
        filter: filteredData,
        condition: filterCondition,
        limit: rowPerPage,
      });
    };
    modal.createModal({
      title: 'Assign New Work',
      content: (
        <AssignModal
          callAPI={callApi}
          deleteTableRowSelect={selectedCancel}
          tablePageToDefault={setResetFlag}
        />
      ),
    });
  };

  const cancelAssignModal = () => {
    const projectId = Number(params.pid);
    // 1 과 2가 변경됨 후에 리펙토링
    const reversedRangeBtn = rangeButton === 1 ? 2 : 1;
    const props = {
      projectId,
      rangeButton: reversedRangeBtn,
      noSelectedRowId,
      rowSelectedStatus,
      selectedRowCount,
      filter: filteredData,
    };
    const callApi = async () => {
      await callTableAPI({
        page,
        order,
        sort,
        filter: filteredData,
        condition: filterCondition,
        limit: rowPerPage,
      });
    };
    modal.createModal({
      size: 'md',
      title: 'Cancel Assign',
      content: (
        <CancelAssignModal
          callAPI={callApi}
          deleteTableRowSelect={selectedCancel}
          {...props}
        />
      ),
    });
  };

  const cancelApproval = async () => {
    const projectId = Number(params.pid);
    const reversedRangeBtn = rangeButton === 1 ? 2 : 1;
    const props = {
      projectId,
      rangeButton: reversedRangeBtn,
      noSelectedRowId,
      rowSelectedStatus,
      selectedRowCount,
      filter: filteredData,
    };

    const callApi = async () => {
      await callTableAPI({
        page,
        order,
        sort,
        filter: filteredData,
        condition: filterCondition,
        limit: rowPerPage,
      });
    };

    modal.createModal({
      size: 'md',
      title: t(`component.btn.cancelApproval`),
      content: (
        <CancelApprovalModal
          callAPI={callApi}
          deleteTableRowSelect={selectedCancel}
          {...props}
        />
      ),
    });
  };

  const selectedCancel = () => {
    setAllSelected(false);
    setNotDisableStatus([]);
    setRowSelectedStatus((rowSelectedStatus) => {
      rowSelectedStatus.clear();
      return rowSelectedStatus;
    });
    setSelectedRow((selectedRow) => {
      selectedRow.clear();
      return selectedRow;
    });
    setAssignButtonStatus(true);
    setCancelButtonStatus(true);
    setSelectedRowCount(0);
  };

  const noAssignedData = useCallback(() => {
    setStatusButton(1);
    // setNotDisableStatus([0]);
    setNotDisableStatus(NO_ASSIGN);
    tableHeadExpand.current.noAssignDataButtonClickStyle();
  }, []);

  const workingData = useCallback(() => {
    setStatusButton(2);
    // setNotDisableStatus([1, 2, 3, 4, 5, 6]);
    setNotDisableStatus(CANCEL_STATUS);
    tableHeadExpand.current.workingDataButtonClickStyle();
  }, []);

  const completeData = useCallback(() => {
    setStatusButton(3);
    // setNotDisableStatus([1]);
    setNotDisableStatus(COMPLETE);
    tableHeadExpand.current.completeDataButtonClickStyle();
  }, []);

  const thisDataRange = useCallback(() => {
    setRowSelectedStatus(new Set());
    setSelectedRow(new Map());
    setRangeButton(2);
    tableHeadExpand.current.thisPageRangeButtonClickStyle();
  }, []);

  const allDataRange = () => {
    setRowSelectedStatus(new Set());
    setSelectedRow(new Map());
    setRangeButton(1);
    tableHeadExpand.current.allDataButtonClickStyle();
  };

  const bottomButtonStatus = useCallback(() => {
    let assign = false;
    let cancel = false;
    let revoke = false;
    selectedRow.forEach((status) => {
      if (NO_ASSIGN.includes(status)) {
        assign = true;
        revoke = false;
      } else if (CANCEL_STATUS.includes(status)) {
        cancel = true;
        revoke = false;
      } else if (COMPLETE.includes(status)) {
        revoke = true;
      }
    });

    if (assign && cancel) {
      setAssignButtonStatus(true);
      setCancelButtonStatus(true);
      setRevokeButtonStatus(true);
    } else if (assign) {
      setAssignButtonStatus(false);
      setCancelButtonStatus(true);
      setRevokeButtonStatus(true);
    } else if (cancel) {
      setAssignButtonStatus(true);
      setCancelButtonStatus(false);
      setRevokeButtonStatus(true);
    } else if (revoke) {
      setAssignButtonStatus(true);
      setCancelButtonStatus(false);
      setRevokeButtonStatus(false);
    } else {
      if (selectedRow.size === 0 && selectedRowCount === 0) {
        setAssignButtonStatus(true);
        setCancelButtonStatus(true);
        setRevokeButtonStatus(true);
      } else if (allSelected && selectedRowCount !== 0) {
        if (statusButton === 1) {
          setAssignButtonStatus(false);
          setCancelButtonStatus(true);
          setRevokeButtonStatus(true);
        } else if (statusButton === 2) {
          setAssignButtonStatus(true);
          setCancelButtonStatus(false);
          setRevokeButtonStatus(true);
        } else if (statusButton === 3) {
          setAssignButtonStatus(true);
          setCancelButtonStatus(true);
          setRevokeButtonStatus(true);
        }
      } else {
        setAssignButtonStatus(true);
        setCancelButtonStatus(true);
        setRevokeButtonStatus(true);
      }
    }
  }, [selectedRow, allSelected, selectedRowCount, statusButton]);

  // row checkbox 클릭
  const rowClickHandler = useCallback(
    (row: DataTableColumnType) => {
      const rowId: number = row.id as number;
      if (rowSelectedStatus.has(rowId)) {
        rowSelectedStatus.delete(rowId);
        selectedRow.delete(rowId);
        setRowSelectedStatus(new Set(rowSelectedStatus));
        setSelectedRow(new Map(selectedRow));
        setAllSelected(false);
      } else {
        rowSelectedStatus.add(rowId);
        if (row.workingStatus !== undefined)
          selectedRow.set(rowId, row.workingStatus);
        setRowSelectedStatus(new Set(rowSelectedStatus));
      }
      setSelectedRow(new Map(selectedRow));
      bottomButtonStatus();

      // 선택 됨 값
      if (rangeButton === 2) setSelectedRowCount(rowSelectedStatus.size);
      else {
        if (rangeButton === 1) {
          if (noSelectedRowId.has(rowId)) {
            noSelectedRowId.delete(rowId);
          } else {
            noSelectedRowId.add(rowId);
          }
        }
        if (!rowSelectedStatus.has(rowId)) {
          setSelectedRowCount((count) => count - 1);
        } else {
          setSelectedRowCount((count) => count + 1);
        }
      }
    },
    [
      bottomButtonStatus,
      noSelectedRowId,
      rangeButton,
      rowSelectedStatus,
      selectedRow,
    ],
  );

  const expandAreaChangeLang = useCallback(() => {
    tableHeadExpand.current.addText({
      cancel: t(`component.btn.cancel`),
      range: t(`page.data.range`),
      status: t(`component.togglebtn.status`),
      allConnectedData: t(`component.togglebtn.allConnectedData`),
      dataInThisPage: t(`page.data.dataInThisPage`),
      notAssigned: t(`page.data.notAssigned`),
      workInProgress: t(`component.togglebtn.workInProgress`),
      completeData: t(`page.data.completed`),
    });
  }, [t]);

  const createHeaderExpand = useCallback(() => {
    let table = tableHeadExpand.current;
    if (!table) {
      const newHeader = new TableHeader();
      tableHeadExpand.current = newHeader;
      table = newHeader;
    }
    table.createElement();
    table.assignFunction(
      selectedCancel,
      workingData,
      noAssignedData,
      thisDataRange,
      allDataRange,
      completeData,
    );
    table.addEventListener();
    table.addStyle();
    if (rangeButton === 1 || rangeButton === undefined) {
      allDataRange();
      if (statusButton === 1 || statusButton === undefined) {
        noAssignedData();
      } else if (statusButton === 2) {
        workingData();
      } else if (statusButton === 3) {
        completeData();
      }
    } else if (rangeButton === 2) {
      thisDataRange();
      if (statusButton === 1) {
        noAssignedData();
      } else if (statusButton === 2 || statusButton === undefined) {
        workingData();
      } else if (statusButton === 3) {
        completeData();
      }
    }
  }, [
    noAssignedData,
    rangeButton,
    statusButton,
    thisDataRange,
    workingData,
    completeData,
  ]);

  const addRowSelectAll = () => {
    setRangeButton(1);
    setStatusButton(1);
    setNotDisableStatus([0]);
  };

  const deleteRowSelectAll = () => {
    rowSelectedStatus.clear();
    selectedRow.clear();
    setSelectedRowCount(0);
    if (!allSelected) {
      setNotDisableStatus([]);
      setAssignButtonStatus(true);
      setCancelButtonStatus(true);
      setRevokeButtonStatus(true);
    } else {
      setRangeButton(1);
      setStatusButton(1);
    }
  };

  // 전체 클릭 해서 row 체크박스 상태 변경
  const selectAllHandler = () => {
    const changeStatus = !allSelected;
    setAllSelected(changeStatus);
    setNoSelectedRowId(new Set());
    if (changeStatus) {
      // 체크 됐을 때 tableHeader 오픈
      addRowSelectAll();
      createHeaderExpand();
    } else {
      setNotDisableStatus([]);
      deleteRowSelectAll();
      setAssignButtonStatus(true);
      setCancelButtonStatus(true);
      setRevokeButtonStatus(true);
      setRangeButton(undefined);
      setStatusButton(undefined);
    }
  };

  const makeTableCheckList = useCallback(
    (list: DataTableColumnType[], addList: number[]) => {
      rowSelectedStatus.clear();
      list?.forEach((list: DataTableColumnType) => {
        const { workingStatus, id } = list;
        if (workingStatus !== undefined && addList.includes(workingStatus)) {
          return id && rowSelectedStatus.add(id);
        }
        return id && rowSelectedStatus.delete(id);
      });

      list?.forEach((list: DataTableColumnType) => {
        const { workingStatus, id } = list;
        if (
          id &&
          workingStatus !== undefined &&
          addList.includes(workingStatus)
        ) {
          return selectedRow.set(id, workingStatus);
        }
        return id && selectedRow.delete(id);
      });
      setSelectedRow(selectedRow);
      setRowSelectedStatus(rowSelectedStatus);
      bottomButtonStatus();
    },
    [bottomButtonStatus, rowSelectedStatus, selectedRow],
  );

  // 확장된 table header 버튼 상태에 따라 클릭된 column 변화
  const columnDataHandler = useCallback(
    (list = tableList) => {
      if (rangeButton === 1 || rangeButton === undefined) {
        selectedRow.clear();
        if (statusButton === 1) {
          makeTableCheckList(list, NO_ASSIGN);
          if (noSelectedRowId.size === 0)
            setSelectedRowCount(currentNotAssigned);
        } else if (statusButton === 2) {
          makeTableCheckList(list, CANCEL_STATUS);
          if (noSelectedRowId.size === 0)
            setSelectedRowCount(currentWorking - complete);
        } else if (statusButton === 3) {
          makeTableCheckList(list, COMPLETE);
          if (noSelectedRowId.size === 0) setSelectedRowCount(complete);
        }
      } else if (rangeButton === 2) {
        if (statusButton === 1) {
          makeTableCheckList(list, NO_ASSIGN);
        } else if (statusButton === 2) {
          makeTableCheckList(list, CANCEL_STATUS);
        } else if (statusButton === 3) {
          makeTableCheckList(list, COMPLETE);
        }
        setSelectedRowCount(rowSelectedStatus.size);
      }

      // 다국화
      expandAreaChangeLang();
      if (allSelected && tableHeadExpand) {
        const firstText: string =
          rangeButton === 1
            ? t(`component.togglebtn.allConnectedData`)
            : t(`page.data.dataInThisPage`);
        const secondText: string =
          statusButton === 1
            ? t(`page.data.notAssignedYet`)
            : t(`page.data.working`);
        let str = '';
        if (lang === 'en') {
          str = `<span style="color:#3e3e3e">
          <em style="font-weight:800;color:#2D76F8"> ${selectedRowCount.toLocaleString()} of ${t(
            `component.lnb.data`,
          )}</em>
          ${secondText} ${firstText} are selected.</span></span>
         `;
        } else {
          str = `<span style="color:#3e3e3e">${firstText} ${secondText} <em style="font-weight:800;color:#2D76F8">${t(
            `component.lnb.data`,
          )} ${selectedRowCount.toLocaleString()}개</em>가 선택되었습니다.</span>`;
        }
        tableHeadExpand.current?.changeInfoText(str);
      }
    },
    [
      allSelected,
      currentNotAssigned,
      currentWorking,
      expandAreaChangeLang,
      lang,
      makeTableCheckList,
      noSelectedRowId.size,
      rangeButton,
      rowSelectedStatus.size,
      selectedRow,
      selectedRowCount,
      statusButton,
      t,
      tableList,
    ],
  );

  const onChangePage = async (e: number) => {
    // 모달에서 페이지정보 가져가기 위한 state
    setPage(e);
    const resp: HttpResponseType = await callTableAPI({
      page: e,
      order,
      sort,
      filter: filteredData,
      condition: filterCondition,
      limit: rowPerPage,
    });
    if (rangeButton === 2) {
      setAllSelected(undefined);
      setNotDisableStatus([0]);
    } else {
      if (
        resp.result.list.filter((list: any) => rowSelectedStatus.has(list.id))
          .length > 0 &&
        !allSelected
      )
        return;
      columnDataHandler(resp.result.list);
    }
  };

  const onSortHandler = async (
    selectedColumn: TableColumn<DataTableColumnType>,
    sortDirection: SortOrder,
  ) => {
    let order = '';
    if (selectedColumn.id === 3) {
      order = 'filename';
    } else if (selectedColumn.id === 4) {
      order = 'date';
    } else if (selectedColumn.id === 5) {
      order = 'labeler';
    } else if (selectedColumn.id === 6) {
      order = 'reviewer';
    } else if (selectedColumn.id === 7) {
      order = 'autoLabeling';
    } else {
      order = 'workingStatus';
    }
    setOrder(order);
    setSort(sortDirection.toUpperCase());
    const resp = await callTableAPI({
      page,
      order,
      sort: sortDirection.toUpperCase(),
      limit: rowPerPage,
    });
    if (
      resp.result.list.filter((list: any) => rowSelectedStatus.has(list.id))
        .length > 0
    )
      return;
    columnDataHandler(resp.result.list);
    onClickHandler(clickHeaderIdx, sortDirection.toUpperCase());
  };

  const onDeleteFilter = (deleteData: FilterDataType) => {
    setFilterCancelStatus(true);
    setFilteredData(
      filteredData.filter(
        (data: FilterDataType) => data.column !== deleteData.column,
      ),
    );
  };

  /**
   * row 클릭 시 해당되는 파일의 annotation Page로 이동하는 메소드
   * @param d 선택된 row의 데이터
   * @param e row에 대한 마우스이벤트 객체
   */
  const onRowClickedHandler = async (d: any, e: React.MouseEvent) => {
    const classTag = 'file_name';
    const offsetClass = String(
      ((e.target as any).offsetParent as any).className,
    );
    const fileId = d.id;

    if (offsetClass.includes(classTag)) {
      await moveToJob(Number(params.pid), fileId, metaData?.result?.type);
    }
  };

  const onDiffAreaClick = useCallback(
    (e: MouseEvent) => {
      if (
        !bntRef.current?.contains(e.target as Node) &&
        !filterRef.current?.contains(e.target as Node)
      ) {
        cancelFilterHandler();
      }
    },
    [cancelFilterHandler],
  );

  const handleResize = debounce(() => {
    setWindowWidth(window.innerWidth);
  }, 100);

  useEffect(() => {
    document.addEventListener('click', onDiffAreaClick);
    return () => {
      document.removeEventListener('click', onDiffAreaClick);
    };
  }, [onDiffAreaClick]);

  useEffect(() => {
    if (allSelected !== undefined && allSelected && !filterCancelStatus) {
      columnDataHandler(tableList);
    }
  }, [allSelected, columnDataHandler, filterCancelStatus, tableList]);

  useEffect(() => {
    if (filterCancelStatus) {
      setFilterCancelStatus(() => false);
      selectedCancel();
    }
  }, [filterCancelStatus]);

  useEffect(() => {
    if (filteredData.length > 0) {
      setFilterCancelStatus(() => true);
    }
  }, [filteredData]);

  useEffect(() => {
    setTableList(list);
  }, [list]);

  useEffect(() => {
    callTableAPI({
      page,
      order,
      sort,
      condition: filterCondition,
      filter: filteredData,
      limit: rowPerPage,
    });
    localStorage.setItem('filter', JSON.stringify(filteredData));
  }, [filteredData, filterCondition, rowPerPage]);

  useEffect(() => {
    if (rowSelectedStatus.size === 0) {
      setAssignButtonStatus(true);
      setCancelButtonStatus(true);
    }
  }, [allSelected]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cx('container')}>
      {/*
      <SideView title='Tutorial'>
        <DataPageGuide />
      </SideView>
  */}
      <div>
        <Header
          selectedRowCount={selectedRowCount}
          connected={connected}
          notAssigned={notAssigned}
          working={working}
          complete={complete}
          windowWidth={windowWidth}
        />
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <InputText
            status='default'
            size='meduium'
            autoFocus
            theme='jp-primary'
            placeholder={t(`component.inputBox.search`)}
            disableLeftIcon={false}
            // disableClearBtn={!value}
            customStyle={{
              width: '220px',
              height: '36px',
              fontFamily: 'SpoqaR',
              fontSize: '14px',
              lineHeight: '14px',
              marginRight: '8px',
            }}
            onChange={onChangeSearch}
            // value={value ?? ''}
            onClear={() => {
              if (onChangeSearch) {
                onChangeSearch();
              }
            }}
          ></InputText>
          <div className={cx('filter-container')}>
            <button
              ref={bntRef}
              disabled={filterButtonDisable}
              onClick={cancelHandler}
              className={cx(
                'filter-button',
                filterButtonDisable ? 'filter-inactive' : 'filter-active',
              )}
            >
              <img
                className={cx('icon')}
                src={filterButtonDisable ? InactiveFilterIcon : FilterIcon}
                alt='icon'
              />
              <Sypo type='P1'>{t(`component.btn.filter`)}</Sypo>
            </button>
            {filterButtonState && (
              <Filter
                filterRef={filterRef}
                reviewerData={reviewerData}
                labelerData={labelerData}
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                cancelHandler={cancelHandler}
              />
            )}
          </div>
        </div>
      </div>
      <div className={cx('appliedFilterSection')}>
        {filteredData.length > 0 && (
          <AppliedFilter
            filteredData={filteredData}
            filterCondition={filterCondition}
            setFilterCondition={setFilterCondition}
            onDeleteFilter={onDeleteFilter}
          />
        )}
      </div>
      {dataStatus === 2 && <ProgressBar completed={progressData} />}
      {dataStatus === 1 && (
        <>
          {tableList.length === 0 && connected === 0 ? (
            <div className={cx('noDatasetSection')}>
              <img src={EmptyFile} alt='' />
              <Sypo color={MONO205} weight='medium' type='h4'>
                {t('page.data.emptyDatasetData')}
              </Sypo>
              <Sypo color={MONO205} weight='medium' type='h4'>
                {t('page.data.emptyDatasetDataSub')}
              </Sypo>
            </div>
          ) : (
            <div className={cx('tableSection')}>
              <DataTable
                tableList={tableList}
                paginationTotalRows={total}
                onChangePage={onChangePage}
                allSelected={allSelected}
                rowClickHandler={rowClickHandler}
                rowSelectedStatus={rowSelectedStatus}
                notDisableStatus={notDisableStatus}
                selectAllHandler={selectAllHandler}
                onSortHandler={onSortHandler}
                setRowPerPage={setRowPerPage}
                resetFlag={resetFlag}
                setClickHeaderIdx={setClickHeaderIdx}
                onRowClickedHandler={onRowClickedHandler}
                isDataPage
                dataType={metaData?.result.type}
              />
              {tableList.length > 0 && (
                <div className={cx('btn-box')}>
                  <Button
                    customStyle={{ marginRight: '10px' }}
                    onClick={createAssignModal}
                    type='primary'
                    disabled={assignButtonStatus}
                  >
                    {t(`component.btn.assignNewWork`)}
                  </Button>
                  <Button
                    onClick={cancelAssignModal}
                    type='primary'
                    disabled={cancelButtonStatus}
                    customStyle={
                      !cancelButtonStatus
                        ? {
                            borderColor: RED502,
                            backgroundColor: RED502,
                          }
                        : { borderColor: MONO202, backgroundColor: MONO202 }
                    }
                  >
                    {t(`component.btn.cancelAssignment`)}
                  </Button>
                  {metaData?.result.type !== 1 &&
                    metaData?.result.workflow !== 0 && (
                      <Button
                        onClick={cancelApproval}
                        type='primary'
                        disabled={revokeButtonStatus}
                        customStyle={
                          !revokeButtonStatus
                            ? {
                                borderColor: YELLOW304,
                                backgroundColor: YELLOW304,
                              }
                            : { borderColor: MONO202, backgroundColor: MONO202 }
                        }
                      >
                        {t(`component.btn.cancelApproval`)}
                      </Button>
                    )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataContents;
