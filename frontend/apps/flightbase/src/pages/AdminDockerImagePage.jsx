import { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import AdminDockerImageContent from '@src/components/pageContents/admin/AdminDockerImageContent';
import useSortColumn from '@src/components/molecules/Table/TableHead/useSortColumn';
import SortColumn from '@src/components/molecules/Table/TableHead/SortColumn';
import { Button, StatusCard } from '@jonathan/ui-react';

// Modal ContentsComponent
import DockerImageFormModalHeader from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalHeader';
import DockerImageFormModalContent from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalContent';
import DockerImageFormModalFooter from '@src/components/Modal/DockerImageFormModal/DockerImageFormModalFooter';

// Hooks
import useIntervalCall from '@src/hooks/useIntervalCall';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import {
  convertByte,
  defaultSuccessToastMessage,
  errorToastMessage,
} from '@src/utils';
import { convertLocalTime } from '@src/datetimeUtils';

// Icon
import Ready from '@src/static/images/icon/ic-status-ready.svg';
import Failed from '@src/static/images/icon/ic-status-failed.svg';
import ProgressYellow from '@src/static/images/icon/ic-status-progress-yellow.svg';
import ProgressGray from '@src/static/images/icon/ic-status-progress-gray.svg';

function AdminDockerImagePage() {
  // Router Hooks
  const history = useHistory();

  // Redux Hooks
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { id } = useParams();

  const [workspaceId, setWorkspaceId] = useState(id);
  const [originData, setOriginData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [uploadType, setUploadType] = useState({
    label: 'allCreateType.label',
    value: 'all',
  });
  const [releaseType, setReleaseType] = useState({
    label: 'allReleaseType.label',
    value: 'all',
  });
  const [keyword, setKeyword] = useState('');
  const [searchKey, setSearchKey] = useState({
    label: 'dockerImageName.label',
    value: 'image_name',
  });
  const { sortClickFlag, onClickHandler, clickedIdx, clickedIdxHandler } =
    useSortColumn(4);

  const columns = [
    {
      name: t('status.label'),
      selector: 'status',
      sortable: false,
      minWidth: '200px',
      maxWidth: '168px',
      cell: ({ id, status, image_name, type }) => {
        switch (status) {
          case 0:
            return (
              <StatusCard
                text={t('pending')}
                status='pending'
                size='medium'
                leftIcon={ProgressYellow}
                customStyle={{
                  width: 'auto',
                  fontSize: '12px',
                }}
                leftIconStyle={{
                  marginRight: '5px',
                }}
                isProgressStatus={true}
              />
            );
          case 1:
            return (
              <>
                <StatusCard
                  text={t('installing')}
                  status='installing'
                  size='medium'
                  leftIcon={ProgressYellow}
                  customStyle={{
                    width: 'auto',
                    marginRight: '10px',
                    fontSize: '12px',
                  }}
                  leftIconStyle={{
                    marginRight: '5px',
                  }}
                  isProgressStatus={true}
                />
                {type !== 0 && (
                  <Button
                    type='primary-reverse'
                    size='small'
                    customStyle={{
                      padding: '0px 12px',
                    }}
                    onClick={() => showLog(id, image_name)}
                  >
                    {t('log.label')}
                  </Button>
                )}
              </>
            );
          case 2:
            return (
              <>
                <StatusCard
                  text={t('ready')}
                  status='ready'
                  size='medium'
                  leftIcon={Ready}
                  customStyle={{
                    width: 'auto',
                    marginRight: '10px',
                    fontSize: '12px',
                  }}
                  leftIconStyle={{
                    marginRight: '5px',
                  }}
                  isProgressStatus={false}
                />
                {type !== 0 && (
                  <Button
                    type='primary-reverse'
                    size='small'
                    customStyle={{
                      padding: '0px 12px',
                    }}
                    onClick={() => showLog(id, image_name)}
                  >
                    {t('log.label')}
                  </Button>
                )}
              </>
            );
          case 3:
            return (
              <>
                <StatusCard
                  text={t('failed')}
                  status='failed'
                  size='medium'
                  leftIcon={Failed}
                  customStyle={{
                    width: 'auto',
                    marginRight: '10px',
                    fontSize: '12px',
                  }}
                  leftIconStyle={{
                    marginRight: '5px',
                  }}
                  isProgressStatus={false}
                />
                {type !== 0 && (
                  <Button
                    type='primary-reverse'
                    size='small'
                    customStyle={{
                      padding: '0px 12px',
                    }}
                    onClick={() => showLog(id, image_name)}
                  >
                    {t('log.label')}
                  </Button>
                )}
              </>
            );
          case 4:
            return (
              <StatusCard
                text={t('deleting')}
                status='stop'
                size='medium'
                leftIcon={ProgressGray}
                customStyle={{
                  width: 'auto',
                  marginRight: '10px',
                  fontSize: '12px',
                }}
                leftIconStyle={{
                  marginRight: '5px',
                }}
                isProgressStatus={true}
              />
            );
          default:
            return <></>;
        }
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('createType.label')}
          idx={0}
        />
      ),
      selector: 'type',
      sortable: true,
      maxWidth: '150px',
      cell: ({ type }) => {
        switch (type) {
          case 0:
            return 'Built-in';
          case 1:
            return 'Pull';
          case 2:
            return 'Tar';
          case 3:
            return 'Dockerfile Build';
          case 4:
            return 'Tag';
          case 5:
            return 'NGC';
          case 6:
            return 'Commit';
          default:
            return '-';
        }
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('releaseType.label')}
          idx={1}
        />
      ),
      selector: 'access',
      sortable: true,
      maxWidth: '132px',
      cell: ({ access }) => {
        if (access === 0) {
          return t('workspace.label');
        }
        return t('global.label');
      },
    },
    {
      name: t('dockerImageName.label'),
      selector: 'image_name',
      sortable: false,
      minWidth: '180px',
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('size.label')}
          idx={2}
        />
      ),
      selector: 'size',
      sortable: true,
      maxWidth: '132px',
      cell: ({ size }) => {
        return (
          <>
            {size !== null
              ? Number.isNaN(Number(size))
                ? size
                : convertByte(size)
              : '-'}
          </>
        );
      },
    },
    {
      name: t('workspace.label'),
      selector: 'workspace_name',
      sortable: false,
      minWidth: '180px',
      cell: ({ workspace, access }) => {
        return access === 0 ? (
          workspace.length > 0 ? (
            <div>
              {workspace.map((ws, idx) => (
                <span key={idx}>
                  {ws.workspace_name}
                  {idx !== workspace.length - 1 && ', '}
                </span>
              ))}
            </div>
          ) : (
            '-'
          )
        ) : (
          'All Workspaces'
        );
      },
    },
    {
      name: t('creator.label'),
      selector: 'user_name',
      sortable: false,
      maxWidth: '170px',
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('createdAt.label')}
          idx={3}
        />
      ),
      selector: 'create_datetime',
      sortable: true,
      maxWidth: '192px',
      cell: ({ create_datetime: date }) => convertLocalTime(date),
    },
    {
      name: t('clone.label'),
      maxWidth: '64px',
      cell: (row) => (
        <img
          style={{
            width: '30px',
            opacity: row.status === 2 && row.type !== 0 ? 1 : 0.2,
          }}
          className='table-icon'
          src='/images/icon/00-ic-basic-copy-o.svg'
          alt='clone'
          onClick={() => {
            if (row.status === 2 && row.type !== 0) onDuplicate(row);
          }}
        />
      ),
      button: true,
    },
    {
      name: t('edit.label'),
      maxWidth: '64px',
      cell: (row) => (
        <img
          style={{
            opacity: row.status === 2 && row.type !== 0 ? 1 : 0.2,
          }}
          className='table-icon'
          src='/images/icon/00-ic-basic-pen.svg'
          alt='edit'
          onClick={() => {
            if (row.status === 2 && row.type !== 0) onUpdate(row);
          }}
        />
      ),
      button: true,
    },
  ];

  const onSortHandler = (selectedColumn, sortDirection, sortedRows) => {
    onClickHandler(clickedIdx, sortDirection);
  };

  /**
   * 도커이미지 생성
   */
  const onCreate = () => {
    dispatch(
      openModal({
        modalType: 'CREATE_DOCKER_IMAGE',
        modalData: {
          headerRender: DockerImageFormModalHeader,
          contentRender: DockerImageFormModalContent,
          footerRender: DockerImageFormModalFooter,
          submit: {
            text: 'create.label',
            func: () => {
              getImages();
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
   * 도커이미지 복제
   *
   * @param {object} row 도커이미지 데이터
   */
  const onDuplicate = (row) => {
    dispatch(
      openModal({
        modalType: 'DUPLICATE_DOCKER_IMAGE',
        modalData: {
          headerRender: DockerImageFormModalHeader,
          contentRender: DockerImageFormModalContent,
          footerRender: DockerImageFormModalFooter,
          submit: {
            text: 'clone.label',
            func: () => {
              getImages();
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: row,
          workspaceId,
        },
      }),
    );
  };

  /**
   * 도커이미지 수정
   *
   * @param {Objeect} row 도커이미지 데이터
   */
  const onUpdate = (row) => {
    dispatch(
      openModal({
        modalType: 'EDIT_DOCKER_IMAGE',
        modalData: {
          headerRender: DockerImageFormModalHeader,
          contentRender: DockerImageFormModalContent,
          footerRender: DockerImageFormModalFooter,
          submit: {
            text: 'edit.label',
            func: () => {
              getImages();
            },
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
   * 도커이미지 설치 로그 모달
   * @param {number} id 도커이미지 아이디
   * @param {string} name 도커이미지 이름
   */
  const showLog = (id, name) => {
    dispatch(
      openModal({
        modalType: 'LOG_DOCKER_IMAGE',
        modalData: {
          id,
          name,
          submit: {
            text: 'confirm.label',
            func: () => {
              dispatch(closeModal('LOG_DOCKER_IMAGE'));
              getImages();
            },
          },
        },
      }),
    );
  };

  /**
   * API 호출 Delete
   * 도커이미지 삭제
   * 체크박스 선택된 데이터 삭제
   */
  const onDelete = async (deleteList) => {
    const { thisList, allList } = deleteList;
    const wsListItem = [];
    thisList?.forEach((id) => wsListItem.push(id.value));
    const allListItem = [];
    allList?.forEach((id) => allListItem.push(id.value));

    const body = {
      workspace_id: workspaceId,
      delete_all_list: allListItem,
      delete_ws_list: wsListItem,
    };

    const response = await callApi({
      url: 'images',
      method: 'delete',
      body,
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setToggledClearRows(!toggledClearRows);
      getImages();
      defaultSuccessToastMessage('delete');
      dispatch(closeModal('DELETE_DOCKER_IMAGE'));
      setSelectedRows([]);
    } else {
      errorToastMessage(error, message);
    }
  };

  /**
   * 도커이미지 삭제 확인 모달
   */
  const openDeleteConfirmPopup = () => {
    dispatch(
      openModal({
        modalType: 'DELETE_DOCKER_IMAGE',
        modalData: {
          submit: {
            text: 'delete.label',
            func: (list) => {
              onDelete(list);
            },
          },
          data: {
            selectedRows,
          },
          cancel: {
            text: 'cancel.label',
            // func: () => {
            //   this.dispatch(closeModal('DELETE_DOCKER_IMAGE'))
            // }
          },
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
    if (name === 'releaseType') {
      setReleaseType(value);
    } else if (name === 'uploadType') {
      setUploadType(value);
    } else if (name === 'searchKey') {
      setSearchKey(value);
    }
  };

  /**
   * 검색
   *
   * @param {string} value 검색할 내용
   */
  const onSearch = (value) => {
    let tableData = originData;

    if (uploadType.value !== 'all') {
      tableData = tableData.filter(
        (item) => item.type === Number(uploadType.value),
      );
    }

    if (releaseType.value !== 'all') {
      tableData = tableData.filter(
        (item) => item.access === Number(releaseType.value),
      );
    }

    if (value !== '') {
      if (searchKey.value === 'workspace_name') {
        tableData = tableData.filter((item) => {
          let found = false;
          if (item.access === 1) {
            found = true;
            return found;
          }
          for (let i = 0; i < item.workspace.length; i += 1) {
            if (item.workspace[i].workspace_name.includes(value)) {
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
   * 검색 내용 제거
   */
  const onClear = () => {
    setKeyword('');
    history.push({ state: undefined });
  };

  /**
   * API 호출 GET
   * 어드민 도커이미지 데이터 가져오기
   */
  const getImages = useCallback(async () => {
    const response = await callApi({
      url: 'images',
      method: 'get',
    });
    const { status, result, message, error } = response;

    if (status === STATUS_SUCCESS) {
      result?.list?.forEach((list) => {
        if (list.workspace.length > 0 && list.workspace[0].workspace_id) {
          setWorkspaceId(list.workspace[0].workspace_id);
        }
      });
      setOriginData(result.list);
      setLoading(false);
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
            label: t('creator.label'),
            value: 'user_name',
          });
        }
      }
      return true;
    } else {
      errorToastMessage(error, message);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.state, keyword, t]);

  useEffect(() => {
    if (originData.length !== 0) onSearch(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadType, releaseType, searchKey, originData, keyword]);

  useIntervalCall(getImages, 1000);

  return (
    <AdminDockerImageContent
      toggledClearRows={toggledClearRows}
      columns={columns}
      tableData={tableData}
      keyword={keyword}
      searchKey={searchKey}
      onClear={onClear}
      onSearchKeyChange={(value) => {
        selectInputHandler('searchKey', value);
      }}
      onSearch={onSearch}
      uploadType={uploadType}
      onUploadTypeChange={(value) => {
        selectInputHandler('uploadType', value);
      }}
      releaseType={releaseType}
      onReleaseTypeChange={(value) => {
        selectInputHandler('releaseType', value);
      }}
      onCreate={onCreate}
      onSelect={onSelect}
      loading={loading}
      totalRows={totalRows}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      deleteBtnDisabled={selectedRows.length === 0}
      onSortHandler={onSortHandler}
    />
  );
}

export default AdminDockerImagePage;
