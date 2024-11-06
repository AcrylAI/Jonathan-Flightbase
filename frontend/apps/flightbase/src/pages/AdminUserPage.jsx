import { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import AdminUserContent from '@src/components/pageContents/admin/AdminUserContent';
import useSortColumn from '@src/components/molecules/Table/TableHead/useSortColumn';
import SortColumn from '@src/components/molecules/Table/TableHead/SortColumn';
import { toast } from '@src/components/Toast';
import { Tooltip } from '@jonathan/ui-react';

// Icons
import UserIcon from '@src/static/images/icon/icon-user-gray.svg';
import UserGroupIcon from '@src/static/images/icon/icon-group-gray.svg';
import BanIcon from '@src/static/images/icon/ban.png';
import ErrorIcon from '@src/static/images/icon/icon-error-c-red.svg';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

function AdminUserPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const _isMounted = useRef(false);
  const tabOptions = [
    { label: t('users.label'), value: 0, icon: UserIcon },
    { label: t('userGroup.label'), value: 1, icon: UserGroupIcon },
  ];
  const [tab, setTab] = useState({ label: t('users.label'), value: 0 });
  const [originData, setOriginData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [userType, setUserType] = useState({
    label: t('allUserType.label'),
    value: 'all',
  });
  const [searchKey, setSearchKey] = useState({
    label: t('userID.label'),
    value: 'name',
  });
  const [keyword, setKeyword] = useState('');

  const { sortClickFlag, onClickHandler, clickedIdx, clickedIdxHandler } =
    useSortColumn(4);

  const {
    sortClickFlag: groupSortClickFlag,
    onClickHandler: groupOnClickHandler,
    clickedIdx: groupClickedIdx,
    clickedIdxHandler: groupClickedIdxHandler,
  } = useSortColumn(4);
  /**
   * 사용자 테이블 데이터 컬럼 정의
   */
  const columns = [
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('userType.label')}
          idx={0}
        />
      ),
      selector: 'real_user_type',
      sortable: true,
      cell: ({ real_user_type: realType }) => {
        let userType = '';
        if (realType === 0) {
          userType = 'admin.label';
        } else if (realType === 1) {
          userType = 'workspaceManager.label';
        } else if (realType === 2) {
          userType = 'trainingOwner.label';
        } else {
          userType = 'user.label';
        }
        return t(userType);
      },
    },
    {
      name: t('userID.label'),
      selector: 'name',
      sortable: false,
      cell: ({ name, locked, not_in_linux: notInLinuxStatus }) => (
        <div
          title={name}
          style={{
            marginLeft: locked ? '-30px' : '0px',
          }}
        >
          {locked && (
            <img
              src={BanIcon}
              style={{
                verticalAlign: 'middle',
                marginRight: '6px',
                width: '24px',
                height: '24px',
              }}
              alt='blocked user'
            />
          )}
          <span>{name}</span>
          {(notInLinuxStatus === 1 || notInLinuxStatus === 2) && (
            <Tooltip
              contents={t('userID.recover.tooltip.message')}
              contentsAlign={{ vertical: 'top', horizontal: 'left' }}
              customStyle={{
                position: 'relative',
                display: 'block',
                marginLeft: '4px',
              }}
              contentsCustomStyle={{ minWidth: '170px' }}
              globalCustomStyle={{ position: 'absolute' }}
              icon={ErrorIcon}
              iconCustomStyle={{ width: '20px', marginTop: '-1px' }}
            />
          )}
        </div>
      ),
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('userGroup.label')}
          idx={1}
        />
      ),
      selector: 'usergroup',
      sortable: true,
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('updatedAt.label')}
          idx={2}
        />
      ),
      selector: 'update_datetime',
      sortable: true,
      cell: ({ update_datetime: date }) => convertLocalTime(date),
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('registered.label')}
          idx={3}
        />
      ),
      selector: 'create_datetime',
      sortable: true,
      cell: ({ create_datetime: date }) => convertLocalTime(date),
    },
    {
      name: t('edit.label'),
      cell: (row) => (
        <img
          src='/images/icon/00-ic-basic-pen.svg'
          alt='edit'
          className='table-icon'
          onClick={() => onUpdate(row)}
        />
      ),
      button: true,
    },
  ];

  /**
   * 사용자 그룹 테이블 데이터 컬럼 정의
   */
  const groupColumns = [
    {
      name: (
        <SortColumn
          onClickHandler={groupClickedIdxHandler}
          sortClickFlag={groupSortClickFlag}
          title={t('groupName.label')}
          idx={0}
        />
      ),
      selector: 'name',
      sortable: true,
    },
    {
      name: (
        <SortColumn
          onClickHandler={groupClickedIdxHandler}
          sortClickFlag={groupSortClickFlag}
          title={t('userCount.label')}
          idx={1}
        />
      ),
      selector: 'user_count',
      sortable: true,
    },
    {
      name: (
        <SortColumn
          onClickHandler={groupClickedIdxHandler}
          sortClickFlag={groupSortClickFlag}
          title={t('updatedAt.label')}
          idx={2}
        />
      ),
      selector: 'update_datetime',
      sortable: true,
      cell: ({ update_datetime: date }) => convertLocalTime(date),
    },
    {
      name: (
        <SortColumn
          onClickHandler={groupClickedIdxHandler}
          sortClickFlag={groupSortClickFlag}
          title={t('registered.label')}
          idx={2}
        />
      ),
      selector: 'create_datetime',
      sortable: true,
      cell: ({ create_datetime: date }) => convertLocalTime(date),
    },
    {
      name: t('edit.label'),
      cell: (row) => (
        <img
          src='/images/icon/00-ic-basic-pen.svg'
          alt='edit'
          className='table-icon'
          onClick={() => {
            onUpdate(row);
          }}
        />
      ),
      button: true,
    },
  ];

  const onSortHandler = (selectedColumn, sortDirection, sortedRows) => {
    tab.value === 0
      ? onClickHandler(clickedIdx, sortDirection)
      : groupOnClickHandler(groupClickedIdx, sortDirection);
  };

  /**
   * API 호출 GET
   * 사용자 그룹 데이터 가져오기
   *
   * @param {object} newState
   */
  const getGroups = async (newState = null) => {
    const response = await callApi({
      url: 'users/group',
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (!_isMounted.current) return;
    if (status === STATUS_SUCCESS) {
      setOriginData(result.list);
      setTableData(result.list);
      setTotalRows(result.total);
      setLoading(false);
      if (newState != null) {
        setSearchKey(newState.searchKey);
        setTab(newState.tab);
      }
      if (keyword !== '') onSearch(keyword);
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 사용자/사용자그룹 생성
   * 현재 tab의 value로 구분
   */
  const onCreate = () => {
    const { value: tabVal } = tab;
    dispatch(
      openModal({
        modalType: tabVal === 0 ? 'CREATE_USER' : 'CREATE_USER_GROUP',
        modalData: {
          submit: {
            text: 'add.label',
            func: tabVal === 0 ? getUsers : getGroups,
          },
          cancel: {
            text: 'cancel.label',
          },
        },
      }),
    );
  };

  /**
   * 사용자/사용자그룹 수정
   * 현재 tab의 value로 구분
   *
   * @param {object} row 사용자/사용자그룹 데이터
   */
  const onUpdate = (row) => {
    const { locked } = row;
    const { value: tabVal } = tab;
    dispatch(
      openModal({
        modalType: tabVal === 0 ? 'EDIT_USER' : 'EDIT_USER_GROUP',
        modalData: {
          submit: {
            text: locked ? 'unblock.label' : 'edit.label',
            func: tabVal === 0 ? getUsers : getGroups,
          },
          cancel: {
            text: 'cancel.label',
          },
          data: row,
        },
      }),
    );
  };

  /**
   * API 호출 DELETE
   * 사용자/사용자그룹 삭제
   * 현재 tab의 value로 구분
   */
  const onDelete = async () => {
    const { value: tabVal } = tab;
    const ids = selectedRows.map(({ id }) => id);
    const response = await callApi({
      url:
        tabVal === 0
          ? `users/${ids.join(',')}`
          : `users/group/${ids.join(',')}`,
      method: 'delete',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setToggledClearRows(!toggledClearRows);
      if (tabVal === 0) {
        getUsers();
      } else {
        getGroups();
      }
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 사용자/사용자그룹 삭제 확인 모달
   * 현재 tab의 value로 구분
   */
  const openDeleteConfirmPopup = () => {
    const { value: tabVal } = tab;
    dispatch(
      openConfirm({
        title:
          tabVal === 0
            ? 'deleteUserPopup.title.label'
            : 'deleteUserGroupPopup.title.label',
        content:
          tabVal === 0
            ? 'deleteUserPopup.message'
            : 'deleteUserGroupPopup.message',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete();
          },
        },
        cancel: {
          text: 'cancel.label',
        },
      }),
    );
  };

  /**
   * 검색/필터 셀렉트 박스 이벤트 핸들러
   *
   * @param {string} name 검색/필터할 항목
   * @param {string} value 검색/필터할 내용
   */
  const selectInputHandler = (name, value) => {
    if (name === 'userType') {
      setUserType(value);
    } else {
      setSearchKey(value);
    }
  };

  /**
   * 검색
   *
   * @param {string} value 검색할 내용
   */
  const onSearch = useCallback(
    (value) => {
      let tableData = originData;
      if (userType.value !== 'all') {
        tableData = tableData.filter(
          (item) => item.real_user_type === Number(userType.value),
        );
      }

      if (value !== '') {
        tableData = tableData.filter((item) =>
          item[searchKey.value].includes(value),
        );
      }

      setKeyword(value);
      setTableData(tableData);
      setTotalRows(tableData.length);
    },
    [originData, searchKey.value, userType.value],
  );

  /**
   * API 호출 GET
   * 사용자 데이터 가져오기
   *
   * @param {object} newState
   */
  const getUsers = useCallback(async (newState = null) => {
    const response = await callApi({
      url: 'users',
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (!_isMounted.current) return;
    if (status === STATUS_SUCCESS) {
      setOriginData(result.list);
      setTableData(result.list);
      setTotalRows(result.total);
      setLoading(false);
      if (newState != null) {
        setSearchKey(newState.searchKey);
        setTab(newState.tab);
      }
    } else {
      errorToastMessage(error, message);
    }
  }, []);

  /**
   * 사용자 복구
   */
  const onRecoverUsers = async () => {
    const body = {};
    const ids = selectedRows.map(({ id }) => id);
    if (ids.length > 0) {
      body.user_ids = ids.join(',');
    }

    const response = await callApi({
      url: 'users/recover-linux-user',
      method: 'POST',
      body,
    });

    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      if (result) {
        toast.success(t('userID.recover.success.message'));
        getUsers();
      }
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 검색 내용 제거
   */
  const onClear = () => {
    onSearch('');
  };

  /**
   * 체크박스 선택
   *
   * @param {object} param0 선택된 행
   */
  const onSelect = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  /**
   * 테이블 데이터 상세정보에서 더보기 항목 이동
   *
   * @param {string} user 사용자 ID
   * @param {string} type 이동할 페이지 (workspaces | trainings | deployments | docker_images | datasets)
   */
  const moreList = (user, type) => {
    history.push({
      pathname: `${type}`,
      state: {
        user,
      },
    });
  };

  /**
   * 탭 변경 핸들러
   * 탭 내용은 tabOptions 참고
   *
   * @param {object} tab { label, value }
   */
  const tabHandler = (tab) => {
    const { value } = tab;
    if (value === 0) {
      getUsers({
        tab,
        searchKey: { label: t('userID.label'), value: 'name' },
      });
    } else {
      getGroups({
        tab,
        searchKey: { label: t('groupName.label'), value: 'name' },
      });
    }
  };

  useEffect(() => {
    _isMounted.current = true;
    setLoading(true);
    getUsers();
    return () => {
      _isMounted.current = false;
    };
  }, [getUsers]);

  useEffect(() => {
    onSearch(keyword);
  }, [keyword, onSearch, searchKey, userType]);

  return (
    <AdminUserContent
      onCreate={onCreate}
      onSelect={onSelect}
      columns={tab.value === 0 ? columns : groupColumns}
      tableData={tableData}
      keyword={keyword}
      searchKey={searchKey}
      onSearch={onSearch}
      onSearchKeyChange={(value) => {
        selectInputHandler('searchKey', value);
      }}
      userType={userType}
      onTypeChange={(value) => {
        selectInputHandler('userType', value);
      }}
      loading={loading}
      totalRows={totalRows}
      toggledClearRows={toggledClearRows}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      deleteBtnDisabled={selectedRows.length === 0}
      moreList={moreList}
      tabHandler={tabHandler}
      tabOptions={tabOptions}
      tab={tab}
      onClear={onClear}
      onSortHandler={onSortHandler}
      onRecoverUsers={onRecoverUsers}
    />
  );
}

export default AdminUserPage;
