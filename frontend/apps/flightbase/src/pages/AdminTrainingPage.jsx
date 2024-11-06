import { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import AdminTrainingContent from '@src/components/pageContents/admin/AdminTrainingContent';
import Status from '@src/components/atoms/Status';
import { toast } from '@src/components/Toast';
import SortColumn from '@src/components/molecules/Table/TableHead/SortColumn';
import useSortColumn from '@src/components/molecules/Table/TableHead/useSortColumn';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

function AdminTrainingPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const _isMounted = useRef(false);
  const [originData, setOriginData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState({
    label: t('allStatus.label'),
    value: 'all',
  });
  const [trainingType, setTrainingType] = useState({
    label: t('allType.label'),
    value: 'all',
  });
  const [searchKey, setSearchKey] = useState({
    label: t('trainingName.label'),
    value: 'training_name',
  });
  const [keyword, setKeyword] = useState('');
  const { sortClickFlag, onClickHandler, clickedIdx, clickedIdxHandler } =
    useSortColumn(3);

  /**
   * 테이블 데이터 컬럼 정의
   */
  const columns = [
    {
      name: t('status.label'),
      selector: 'status',
      sortable: false,
      maxWidth: '128px',
      cell: ({ status: { status, reason } }) => (
        <Status
          status={status === 'running' ? 'trainingRunning' : status}
          title={reason}
          type='dark'
        />
      ),
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('type.label')}
          idx={0}
        />
      ),
      selector: 'type',
      sortable: true,
      maxWidth: '130px',
      cell: ({ type }) => (type === 'built-in' ? 'Built-in' : 'Custom'),
    },
    {
      name: t('trainingName.label'),
      selector: 'training_name',
      sortable: false,
      minWidth: '170px',
    },
    {
      name: t('workspace.label'),
      selector: 'workspace_name',
      sortable: false,
      minWidth: '180px',
    },
    {
      name: t('owner.label'),
      selector: 'user_name',
      sortable: false,
      maxWidth: '170px',
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('lastRunDateTime.label')}
          idx={1}
        />
      ),
      selector: 'last_run_datetime',
      sortable: true,
      maxWidth: '192px',
      cell: ({ last_run_datetime: date }) => {
        if (date === null || date === '') {
          return <div>-</div>;
        }
        return convertLocalTime(date);
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('resource.label')}
          idx={2}
        />
      ),
      selector: 'resource_info',
      sortable: true,
      minWidth: '120px',
      cell: ({ resource_info: { resource_usage: resource } }) => {
        return (
          <div>
            CPU*{resource.cpu}, GPU*{resource.gpu}
          </div>
        );
      },
    },
    {
      name: t('stop.label'),
      minWidth: '70px',
      maxWidth: '70px',
      cell: ({
        status: { status },
        id,
        jupyter: {
          editor: { status: editorStatus },
        },
      }) => {
        const activeStatus = ['running', 'pending', 'error', 'installing'];
        return activeStatus.includes(status) ||
          activeStatus.includes(editorStatus) ? (
          <img
            className='table-icon'
            src='/images/icon/ic-stop.svg'
            alt='stop'
            onClick={() => {
              onStop(id);
            }}
          />
        ) : (
          <img
            className='table-icon disabled'
            src='/images/icon/ic-stop.svg'
            alt='stop'
          />
        );
      },
      button: true,
    },
    {
      name: t('edit.label'),
      minWidth: '70px',
      maxWidth: '70px',
      cell: (row) => (
        <img
          className='table-icon'
          src='/images/icon/00-ic-basic-pen.svg'
          alt='edit'
          onClick={() => {
            onUpdate(row);
          }}
        />
      ),
      button: true,
    },
  ];

  /**
   * API 호출 GET
   * 어드민 학습 데이터 가져오기
   */
  const getTrainingsData = async () => {
    setLoading(true);
    const response = await callApi({
      url: 'trainings',
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (!_isMounted.current) return;
    if (status === STATUS_SUCCESS) {
      setOriginData(result.list);
      setTableData(result.list);
      setTotalRows(result.total);
      setSelectedRows([]);
      // 상세정보에서 넘어 올 경우
      if (history.location.state) {
        const { workspace, user } = history.location.state;
        if (workspace) {
          setKeyword(workspace);
          selectInputHandler('searchKey', {
            label: t('workspace.label'),
            value: 'workspace_name',
          });
        } else if (user) {
          setKeyword(user);
          selectInputHandler('searchKey', {
            label: t('user.label'),
            value: 'users',
          });
        }
      }
      if (keyword !== '') onSearch(keyword);
    } else {
      errorToastMessage(error, message);
    }
    setLoading(false);
  };
  /**
   * 검색 내용 제거
   */
  const onClear = () => {
    setKeyword('');
    onSearch('');
    history.push({ state: undefined });
  };

  const onSortHandler = (selectedColumn, sortDirection, sortedRows) => {
    onClickHandler(clickedIdx, sortDirection);
  };

  /**
   * 학습 생성
   */
  const onCreate = () => {
    dispatch(
      openModal({
        modalType: 'CREATE_TRAINING',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              getTrainingsData();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
        },
      }),
    );
  };

  /**
   * 학습 수정
   *
   * @param {object} row 학습 데이터
   */
  const onUpdate = (row) => {
    dispatch(
      openModal({
        modalType: 'EDIT_TRAINING',
        modalData: {
          submit: {
            text: 'edit.label',
            func: () => {
              getTrainingsData();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: row,
          workspaceId: row.workspace_id,
        },
      }),
    );
  };

  /**
   * API 호출 Delete
   * 학습 삭제
   * 체크박스 선택된 학습 삭제
   */
  const onDelete = async () => {
    const ids = selectedRows.map(({ id }) => id);
    const response = await callApi({
      url: `trainings/${ids.join(',')}`,
      method: 'delete',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setToggledClearRows(!toggledClearRows);
      getTrainingsData();
      defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 학습 삭제 확인 모달
   */
  const openDeleteConfirmPopup = () => {
    dispatch(
      openConfirm({
        title: 'deleteTrainingPopup.title.label',
        content: 'deleteTrainingPopup.content.message',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete();
          },
        },
        cancel: {
          text: 'cancel.label',
        },
        confirmMessage: t('deleteTrainingPopup.title.label'),
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
    if (name === 'trainingStatus') {
      setTrainingStatus(value);
    } else if (name === 'searchKey') {
      setSearchKey(value);
    } else if (name === 'trainingType') {
      setTrainingType(value);
    }
  };
  /**
   * 검색
   *
   * @param {string} value 검색할 내용
   */
  const onSearch = (value) => {
    let tableData = originData;
    if (trainingStatus.value !== 'all') {
      tableData = tableData.filter(
        (item) => item.status.status === trainingStatus.value,
      );
    }
    if (trainingType.value !== 'all') {
      tableData = tableData.filter((item) => item.type === trainingType.value);
    }

    if (value !== '') {
      if (searchKey.value === 'users') {
        tableData = tableData.filter((item) => {
          let found = false;
          for (let i = 0; i < item.users.length; i += 1) {
            if (item.users[i].user_name.includes(value)) {
              found = true;
              break;
            }
          }
          return found;
        });
      } else {
        tableData = tableData.filter((item) =>
          item[searchKey.value].includes(value),
        );
      }
    }
    setKeyword(value);
    setTableData(tableData);
    setTotalRows(tableData.length);
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
   * 학습 종료
   *
   * @param {number} id 학습 ID
   */
  const onStop = async (id) => {
    const response = await callApi({
      url: `trainings/stop?training_id=${id}`,
      method: 'GET',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      getTrainingsData();
      defaultSuccessToastMessage('stop');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 작업/HPS 종료
   *
   * @param {string} type job or hps
   * @param {number} id 작업/HPS ID
   */
  const jobStop = async (type, id) => {
    let url = '';
    if (type === 'job') {
      url = `trainings/stop_jobs?training_id=${id}`;
    } else {
      url = `trainings/stop_hyperparam_search?hps_id=${id}`;
    }
    const response = await callApi({
      url,
      method: 'GET',
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      getTrainingsData();
      defaultSuccessToastMessage('stop');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * Jupyter Notebook 링크로 이동
   *
   * @param {number} trainingId 학습 ID
   * @param {boolean} editor 편집용 여부 (true or false)
   */
  const moveJupyterLink = async (trainingId, editor) => {
    let url = `trainings/jupyter_url?training_id=${trainingId}`;
    if (editor) {
      url += '&editor=true';
    }
    const response = await callApi({
      url,
      method: 'GET',
    });

    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      window.open(result.url, '_blank');
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * Jyputer Notebook 활성화/비활성화
   *
   * @param {*} act run or stop
   * @param {*} trainingId 학습 ID
   * @param {*} editor 편집용 여부 (true or false)
   */
  const onJupyterControl = async (act, trainingId, editor) => {
    // run or stop
    let url = `trainings/${act}_jupyter?training_id=${trainingId}`;
    if (editor) {
      url += '&editor=true';
    }
    const response = await callApi({
      url,
      method: 'GET',
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      getTrainingsData();
      toast.success(act);
    } else {
      getTrainingsData();
      errorToastMessage(error, message);
    }
  };

  /**
   * 새로고침
   */
  const onRefresh = async () => {
    setRefresh(true);
    await getTrainingsData();
    setRefresh(false);
  };

  useEffect(() => {
    onSearch(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey, trainingStatus, trainingType]);

  useEffect(() => {
    _isMounted.current = true;
    getTrainingsData();
    return () => {
      _isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminTrainingContent
      columns={columns}
      tableData={tableData}
      keyword={keyword}
      searchKey={searchKey}
      totalRows={totalRows}
      toggledClearRows={toggledClearRows}
      refresh={refresh}
      loading={loading}
      deleteBtnDisabled={selectedRows.length === 0}
      trainingType={trainingType}
      trainingStatus={trainingStatus}
      onStatusChange={(value) => {
        selectInputHandler('trainingStatus', value);
      }}
      onTypeChange={(value) => {
        selectInputHandler('trainingType', value);
      }}
      onSearchKeyChange={(value) => {
        selectInputHandler('searchKey', value);
      }}
      onSearch={onSearch}
      onCreate={onCreate}
      onSelect={onSelect}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      moveJupyterLink={moveJupyterLink}
      onJupyterControl={onJupyterControl}
      jobStop={jobStop}
      onClear={onClear}
      onRefresh={onRefresh}
      onSortHandler={onSortHandler}
    />
  );
}

export default AdminTrainingPage;
