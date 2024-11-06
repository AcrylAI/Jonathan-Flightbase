import { useCallback, useState, useRef, useEffect } from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';
import {
  deleteProgressList,
  openProgressList,
} from '@src/store/modules/progressList';
import { startPath } from '@src/store/modules/breadCrumb';
import {
  closeDownloadProgress,
  openDownloadProgress,
  setDownloadProgress,
} from '@src/store/modules/download';
import {
  closeMultiLoading,
  openMultiLoading,
} from '@src/store/modules/loading';

// Components
import LocalFileFormModalContent from '@src/components/Modal/LocalFileFormModal/LocalFileFormModalContent';
import LocalFileFormModalHeader from '@src/components/Modal/LocalFileFormModal/LocalFileFormModalHeader';
import LocalFileFormModalFooter from '@src/components/Modal/LocalFileFormModal/LocalFileFormModalFooter';
import DatasetDetailContent from '@src/components/pageContents/common/DatasetDetailContent';
import DatasetFormModalHeader from '@src/components/Modal/DatasetFormModal/DatasetFormModalHeader';
import DatasetFormModalContent from '@src/components/Modal/DatasetFormModal/DatasetFormModalContent';
import DatasetFormModalFooter from '@src/components/Modal/DatasetFormModal/DatasetFormModalFooter';
import { toast } from '@src/components/Toast';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Hooks
import useComponentDidMount from '@src/hooks/useComponentDidMount';

// Network
import {
  network,
  callApi,
  upload,
  callApiWithForm,
  STATUS_SUCCESS,
} from '@src/network';

function ReqInstance(promisFunc, name) {
  this.name = name;
  this.result = true;
  this.callback = () => {};
  this.doneFunc = () => {};
  this.init(promisFunc);
}

ReqInstance.prototype.init = async function (promisFunc) {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  while (true) {
    await sleep(1000);
    this.result = await promisFunc();
    this.callback(this.result);
    if (!this.result) break;
    if (this.result?.done) {
      this.doneFunc();
      break;
    }
  }
};

ReqInstance.prototype.setCallback = function (func) {
  this.callback = func;
};
ReqInstance.prototype.setDoneFunc = function (func) {
  this.doneFunc = func;
};

function DatasetDetailPage({ trackingEvent }) {
  const mounted = useRef(false);
  const { t } = useTranslation();

  // Router Hooks
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();

  const { id: wid, did: datasetId } = match.params;

  // Redux hooks
  const dispatch = useDispatch();

  let loading = useSelector((state) => state.loading.multiLoading);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [tree, setTree] = useState([]);
  const [changedFolderName, setChangedFolderName] = useState([]); // 폴더 트리가 서버에서 업데이트 되기 전에 변경된 폴더명 저장
  const [path, setPath] = useState(['']);
  const [pathInputVal, setPathInputVal] = useState('/');
  const [historyVal, setHistoryVal] = useState([
    { path: [''], page: 1, pathInputVal: '/' },
  ]);
  const [historyTmp, setHistoryTmp] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  const [dirCount, setDirCount] = useState(-1); // 폴더 전체 개수
  const [totalFileCount, setTotalFileCount] = useState(-1); // 파일 전체 개수
  const [totalSize, setTotalSize] = useState(-1); // 파일 전체 사이즈
  const [accessType, setAccessType] = useState(-1);
  const [fileList, setFileList] = useState([]); // 파일 목록
  const [fileCount, setFileCount] = useState(0); // 현재 경로의 파일수
  const [selectedRows, setSelectedRows] = useState([]); // 테이블에서 체크된 row 목록
  const [toggledClearRows, setToggledClearRows] = useState(false); // 해당 값이 바뀔 때 테이블에서 체크된 row 초기화 (모두 체크 해제)
  const [keyword, setKeyowrd] = useState(''); // 검색 키워드
  const [permissionLevel, setPermissionLevel] = useState(null); // 권한 레벨
  const [searchKey, setSearchKey] = useState({
    label: t('name.label'),
    value: 'name',
  });
  const [fileType, setFileType] = useState({
    label: t('allType.label'),
    value: 'all',
  });
  const [paginationResetDefaultPage, setPaginationResetDefaultPage] =
    useState(false);
  const [autoLabelingProgress, setAutoLabelingProgress] = useState(null);
  const [downloading, setDownloading] = useState(false); // 다운로드 중
  const [disabledDecompress, setDisabledDecompress] = useState(true); // 압축해제 불가
  const [decompressing, setDecompressing] = useState(false); // 압축해제 중
  const [deleting, setDeleting] = useState(false); // 삭제 중
  const [destinationPath, setDestinationPath] = useState(''); // 이동/복사 경로
  const [newFolder, setNewFolder] = useState(''); // 이동/복사 새폴더
  const [isCopy, setIsCopy] = useState(false); // 복사본 만들기 여부
  const [tableLoading, setTableLoading] = useState(true);

  /**
   * Action 브래드크럼
   * @param {String} wid
   * @param {String} title
   */
  const breadCrumbHandler = useCallback(
    (wid, title) => {
      dispatch(
        startPath([
          {
            component: {
              name: t('Dataset'),
              path: `/user/workspace/${wid}/datasets`,
            },
          },
          {
            component: {
              name: title,
            },
          },
        ]),
      );
    },
    [dispatch, t],
  );

  /**
   * 데이터셋 상세 search 조회
   * @returns boolean
   */
  const getSearchData = useCallback(
    async ({ keywordValue, pathData, selectInput }) => {
      setTableLoading(true);
      const newKeywordValue =
        keywordValue || keywordValue === '' ? keywordValue : keyword;
      const { value: searchKeyItem } = selectInput ? selectInput : searchKey; //*넘어오는걸 먼저 두고 넘어오는거 있으면 넘어오는거 없으면 setState
      const { value: searchType } = selectInput ? selectInput : fileType;
      const searchSize = pathData?.size ? pathData.size : size;
      let url = `datasets/${datasetId}/files?search_page=${
        pathData?.page ? pathData?.page : page
      }&search_size=${searchSize}&search_value=${newKeywordValue}&search_key=${searchKeyItem}&search_type=${searchType}`;
      url += `&search_path=${
        pathData?.path ? pathData?.path.join('/') : path.join('/')
      }`;
      const response = await callApi({
        url,
        method: 'get',
      });

      const { result, message, status, error } = response;

      if (status === STATUS_SUCCESS) {
        const { list: fileList, file_count: fileCount } = result;
        setFileList(fileList);
        setFileCount(fileCount);
        setTableLoading(false);

        return true;
      }
      setTableLoading(false);
      errorToastMessage(error, message);
      return false;
    },
    [datasetId, fileType, keyword, page, path, searchKey, size],
  );

  /**
   * API 호출 GET
   * Dataset 정보 조회
   */
  const getDatasetInfo = useCallback(
    async (isMount) => {
      const {
        id: datasetId,
        name: datasetName,
        description: datasetDesc,
        accessType,
        permissionLevel,
        workspaceId,
      } = location?.state;

      if (isMount) {
        setDatasetName(datasetName);
        setDatasetDesc(datasetDesc);
        setAccessType(accessType);
        setPermissionLevel(permissionLevel);
        setWorkspaceId(workspaceId);
      }

      const url = `datasets/${datasetId}/files/info`;
      const response = await callApi({
        url,
        method: 'get',
      });

      const { result, message, status, error } = response;
      if (mounted.current) {
        if (status === STATUS_SUCCESS) {
          const {
            name: datasetName,
            description: datasetDesc,
            access: accessType,
            dir_count: dirCount,
            file_count: totalFileCount,
            size,
            permission_level: permissionLevel,
            workspace_id: workspaceId,
            workspace_name: workspaceName,
            autolabeling_progress: autoLabelingProgress,
          } = result;

          breadCrumbHandler(workspaceId, datasetName);
          setDatasetName(datasetName);
          setDatasetDesc(datasetDesc);
          setAccessType(accessType);
          setDirCount(dirCount);
          setTotalFileCount(totalFileCount);
          setTotalSize(size);
          setPermissionLevel(permissionLevel);
          setWorkspaceId(workspaceId);
          setWorkspaceName(workspaceName);
          setAutoLabelingProgress(autoLabelingProgress);

          return true;
        }
        errorToastMessage(error, message);
        return false;
      }
    },
    [breadCrumbHandler, location.state],
  );

  /**
   * API 호출 POST
   * Dataset 정보 동기화
   */
  const syncInfo = useCallback(async () => {
    const { id: datasetId } = location.state;

    const url = `datasets/${datasetId}/files/info`;
    const response = await callApi({
      url,
      method: 'post',
    });

    const { message, status, error } = response;

    if (status === STATUS_SUCCESS) {
      return true;
    }
    errorToastMessage(error, message);
    return false;
  }, [location.state]);

  /**
   * DB 스레드의 동기화 작업 완료 여부 확인
   */
  const checkSyncThread = useCallback(
    async (isToastBlock) => {
      const { id: datasetId, workspaceId } = location.state;

      const url = `datasets/synchronization`;
      const form = new FormData();
      form.append('workspace_id', workspaceId);
      form.append('dataset_id', datasetId);

      const response = await callApiWithForm({
        url,
        method: 'PUT',
        form,
      });

      const { status, message, error } = response;

      if (status === STATUS_SUCCESS) {
        if (!isToastBlock) {
          defaultSuccessToastMessage('sync');
        }
        return true;
      }
      errorToastMessage(error, message);
      return false;
    },
    [location.state],
  );

  /**
   * API 호출 GET
   * Dataset 폴더 경로 조회
   */
  const getDatasetDirList = useCallback(async () => {
    const url = `datasets/${datasetId}/tree`;
    const response = await callApi({
      url,
      method: 'get',
    });

    const { result, message, status, error } = response;

    if (status === STATUS_SUCCESS) {
      if (result.tree) {
        const { tree } = result;
        const newTree = [...tree];

        newTree.unshift('/'); // root 경로 추가
        newTree.pop(); // dir 개수 삭제
        changedFolderName.forEach((changedInfo) => {
          const { folderLocation, originName, changedName } = changedInfo;
          const loc = folderLocation.split('/').length - 1;
          newTree.forEach((dir, i) => {
            const originDir = dir.split('/');
            if (originDir[loc] === originName) {
              originDir[loc] = changedName;
              newTree[i] = originDir.join('/');
            }
          });
        });
        setTree(newTree);
        return true;
      }
    } else {
      errorToastMessage(error, message);
    }
  }, [changedFolderName, datasetId]);

  /**
   * 페이지 이동 이벤트
   *
   * @param {number} page 페이지 번호
   */
  const onChangePage = (page) => {
    setPage(page);
    getDatasetDetail({ page });
  };

  /**
   * 한번에 보여줄 row 갯수 변경
   *
   * @param {number} size 한페이지에 볼 개수
   * @param {number} page 페이지 번호
   */
  const onChangeRowsPerPage = (size, page) => {
    setSize(size);
    setPage(page);
    getDatasetDetail({ size, page });
  };

  /**
   * 압축해제 가능 여부 체크
   *
   * @param {object} selectedRows
   */
  const disableDecompression = (selectedRows) => {
    let disabledCount = 0;
    selectedRows.map(({ type, name }) => {
      if (
        type !== 'file' ||
        // 확장자 리스트 .zip, .tar, .tar.gz
        (name.indexOf('.zip') === -1 &&
          name.indexOf('.tar') === -1 &&
          name.indexOf('.tar.gz') === -1)
      ) {
        disabledCount += 1;
      }
      return disabledCount;
    });
    return disabledCount > 0;
  };

  /**
   * 체크박스 선택
   *
   * @param {object} param0 선택된 행
   */
  const onSelect = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
    setDisabledDecompress(disableDecompression(selectedRows));
  };

  /**
   * 검색 내용 제거
   */
  const onClear = () => {
    setKeyowrd('');
    onSearch('');
  };

  /**
   * 파일 업로드
   */
  const onFileUpload = () => {
    const loc = `${path.join('/')}/`;

    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open File Upload Modal',
    });
    dispatch(
      openModal({
        modalType: 'UPLOAD_FILE',
        modalData: {
          headerRender: LocalFileFormModalHeader,
          contentRender: LocalFileFormModalContent,
          footerRender: LocalFileFormModalFooter,
          submit: {
            text: t('upload.label'),
            func: () => {
              onDatasetDirUpdate();
              trackingEvent({
                category: 'Dataset File Upload Modal',
                action: 'Upload Dataset File',
              });
            },
          },
          cancel: {
            text: t('cancel.label'),
            func: () => {
              dispatch(closeModal('UPLOAD_FILE'));
            },
          },
          datasetId,
          loc,
          workspaceName,
          workspaceId,
          datasetName,
          fileType: 'array',
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
    if (name === 'searchKey') {
      setSearchKey(value);
    } else if (name === 'fileType') {
      setFileType(value);
    }
    getSearchData({ selectInput: value });
  };

  /**
   * 검색
   *
   * @param {string} value 검색할 내용
   */
  const onSearch = (value) => {
    setKeyowrd(value);
    setPage(1);

    getDatasetDetail({ page: 1 }, value);
  };

  /**
   * 뒤로가기
   */
  const goBack = () => {
    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Move To Prev Page',
    });
    history.goBack();
  };

  /**
   * 데이터셋 삭제 확인 모달
   */
  const openDeleteConfirmPopup = () => {
    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open Delete Dataset File Confirm Popup',
    });
    dispatch(
      openConfirm({
        title: 'deleteFilePopup.title.label',
        content: 'deleteFilePopup.message',
        submit: {
          text: 'delete.label',
          func: () => {
            onDelete();
            trackingEvent({
              category: 'Dataset Detail Page',
              action: 'Delete Dataset File',
            });
          },
        },
        cancel: {
          text: 'cancel.label',
        },
      }),
    );
  };

  /**
   * 데이터셋 정보 수정
   */
  const onUpdate = () => {
    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open Edit Dataset Modal',
    });

    dispatch(
      openModal({
        modalType: 'EDIT_DATASET',
        modalData: {
          headerRender: DatasetFormModalHeader,
          contentRender: DatasetFormModalContent,
          footerRender: DatasetFormModalFooter,
          submit: {
            text: 'edit.label',
            func: () => {
              onDatasetDirUpdate();
              trackingEvent({
                category: 'Dataset Edit Modal',
                action: 'Edit Dataset',
              });
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: { id: datasetId },
          workspaceId: wid,
        },
      }),
    );
  };

  /**
   * 폴더 생성
   */
  const onCreateFolder = () => {
    const loc = `${path.join('/')}/`;

    dispatch(
      openModal({
        modalType: 'CREATE_FOLDER',
        modalData: {
          submit: {
            text: 'create.label',
            func: () => {
              onDatasetDirUpdate();
              trackingEvent({
                category: 'Folder Create Modal',
                action: 'Create Folder',
              });
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          data: { id: datasetId },
          workspaceId,
          datasetId,
          loc,
          workspaceName,
          datasetName,
          accessType,
        },
      }),
    );
  };
  /**
   * API 호출 GET
   * 데이터셋 상세 데이터 조회
   */
  const getDatasetDetail = useCallback(
    async (pathData, value) => {
      getDatasetDirList();

      const isSearch = await getSearchData({ keywordValue: value, pathData });
      if (isSearch === false) {
        return;
      }
      const isInfo = await getDatasetInfo(true);
      if (isInfo === false) {
        return false;
      }
    },
    [getDatasetDirList, getDatasetInfo, getSearchData],
  );

  /**
   * 한림대용 DB에서 업로드
   */
  const onDatabaseUpload = async () => {
    const loc = `${path.join('/')}/`;
    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open Hanlim DB Upload Modal',
    });

    dispatch(
      openModal({
        modalType: 'UPLOAD_HANLIM',
        modalData: {
          submit: {
            text: t('upload.label'),
            func: () => {
              onDatasetDirUpdate();
              trackingEvent({
                category: 'Hanlim DB Upload Modal',
                action: 'Hanlim DB Upload',
              });
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          data: { id: datasetId },
          workspaceId,
          datasetId,
          loc,
          workspaceName,
          datasetName,
          accessType,
        },
      }),
    );

    // const response = await callApi({
    //   url: `datasets/${datasetId}/get_db`,
    //   method: 'get',
    // });

    // const { status, message } = response;

    // if (status === STATUS_SUCCESS) {
    //   defaultSuccessToastMessage('upload');
    // } else {
    //   errorToastMessage({}, message);
    // }
  };

  /**
   * 구글드라이브 업로드
   */
  const onGoogleDriveUpload = () => {
    const loc = `${path.join('/')}/`;
    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open Google Drive Modal',
    });
    dispatch(
      openModal({
        modalType: 'UPLOAD_GOOGLE_DRIVE',
        modalData: {
          submit: {
            text: t('upload.label'),
            func: () => {
              getDatasetDetail();
              trackingEvent({
                category: 'Google Drive Upload Modal',
                action: 'Google Drive Upload',
              });
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          data: { id: datasetId },
          workspaceId,
          datasetId,
          loc,
          workspaceName,
          datasetName,
          accessType,
        },
      }),
    );
  };

  /**
   * GitHub Clone
   */
  const onGitHubClone = () => {
    const loc = `${path.join('/')}/`;

    trackingEvent({
      category: 'Dataset Detail Page',
      action: 'Open Github Clone Modal',
    });
    dispatch(
      openModal({
        modalType: 'CLONE_GITHUB',
        modalData: {
          submit: {
            text: t('clone.label'),
            func: () => {
              getDatasetDetail();
              trackingEvent({
                category: 'Github Clone Modal',
                action: 'Github Clone',
              });
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          data: { id: datasetId },
          workspaceId,
          datasetId,
          loc,
          workspaceName,
          datasetName,
          accessType,
        },
      }),
    );
  };

  /**
   * 파일/폴더 이름 변경
   *
   * @param {object} row 파일/폴더 데이터
   */
  const onUpdateName = (row) => {
    const type = row.type === 'dir' ? 'Folder' : 'File';

    const loc = `${path.join('/')}/`;

    trackingEvent({
      category: 'Dataset Detail Page',
      action: `Open Edit ${type} Modal`,
    });

    dispatch(
      openModal({
        modalType: `EDIT_${type.toUpperCase()}`,
        modalData: {
          submit: {
            text: 'edit.label',
            func: () => {
              getDatasetDetail();
              setToggledClearRows(!toggledClearRows);
              trackingEvent({
                category: `${type} Edit Modal`,
                action: `Edit ${type}`,
              });
            },
          },
          cancel: {
            text: 'cancel.label',
          },
          onChangedFolderName: (folderLocation, originName, changedName) => {
            if (tree.length === 0) {
              setChangedFolderName(
                changedFolderName.length > 0
                  ? [
                      ...changedFolderName,
                      {
                        originName,
                        changedName,
                        folderLocation,
                      },
                    ]
                  : [
                      {
                        originName,
                        changedName,
                        folderLocation,
                      },
                    ],
              );
            } else {
              const loc = folderLocation.split('/').length - 1;
              const newTree = JSON.parse(JSON.stringify(tree));
              newTree.forEach((dir, i) => {
                const originDir = dir.split('/');
                if (originDir[loc] === originName) {
                  originDir[loc] = changedName;
                  newTree[i] = originDir.join('/');
                }
              });
              setTree(newTree);
            }
          },
          data: row,
          datasetId,
          loc,
          workspaceName,
          workspaceId,
          datasetName,
          accessType,
        },
      }),
    );
  };

  /**
   * API 호출 GET
   * 체크박스 선택 파일 다운로드
   *
   * @returns {blob} tar 압축파일
   */
  const onFileDownload = async () => {
    setDownloading(true);
    const loc = `${path.join('/')}/`;
    const files = selectedRows.map(({ name }) => name);
    dispatch(openDownloadProgress());
    const response = await network.callApiWithPromise({
      url: `datasets/download?dataset_id=${datasetId}&path=${loc}&download_files=${files.join(
        ' ',
      )}`,
      method: 'get',
      responseType: 'blob',
      onDownloadProgress: (progress) => {
        dispatch(setDownloadProgress([progress, files]));
      },
    });

    const { status, data, headers } = response;
    let fileName = files;
    let blob;
    if (status === 200) {
      try {
        const { status } = JSON.parse(data);
        if (status === STATUS_SUCCESS) {
          if (files.length === 1) {
            fileName = files;

            const contentDisposition = headers['content-disposition']; // 파일 이름 포함된 객체

            if (contentDisposition) {
              const [fileNameMatch] = contentDisposition
                .split(';')
                .filter((str) => str.includes('filename'));

              if (fileNameMatch)
                [, fileName] = fileNameMatch
                  .replaceAll('"', '')
                  .split('filename=');
            }
            blob = new Blob([data], { type: 'application/octet-stream' });
            fileName = Buffer.from(fileName, 'base64').toString('utf8'); // 파일 이름 디코딩
          } else {
            blob = new Blob([data], { type: 'application/x-tar' });
            fileName = `[${datasetName}]_${files.length}_files.tar`;
          }
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          defaultSuccessToastMessage('download');
        } else {
          dispatch(closeDownloadProgress());
          toast.error(t('dataset.004.error.message'));
        }
      } catch (_) {
        if (files.length === 1) {
          fileName = files;

          const contentDisposition = headers['content-disposition']; // 파일 이름 포함된 객체

          if (contentDisposition) {
            const [fileNameMatch] = contentDisposition
              .split(';')
              .filter((str) => str.includes('filename'));

            if (fileNameMatch)
              [, fileName] = fileNameMatch
                .replaceAll('"', '')
                .split('filename=');
          }
          blob = new Blob([data], { type: 'application/octet-stream' });
          fileName = Buffer.from(fileName, 'base64').toString('utf8'); // 파일 이름 디코딩
        } else {
          blob = new Blob([data], { type: 'application/x-tar' });
          fileName = `[${datasetName}]_${files.length}_files.tar`;
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        defaultSuccessToastMessage('download');
      }
    } else {
      toast.error(t('dataset.004.error.message'));
    }
    setDownloading(false);
  };

  /**
   * API 호출 GET
   * 체크박스 선택 파일 압축해제
   *
   * @returns
   */
  const onDecompressFile = async () => {
    setDecompressing(true);

    const loc = `${path.join('/')}/`;
    const files = selectedRows.map(({ name }) => name);
    const isSuccessList = Array.from({ length: files.length }, () => true);

    files.map(async (file, idx) => {
      const response = await callApi({
        url: `datasets/decompression?dataset_id=${datasetId}&path=${loc}&files=${file}`,
        method: 'get',
      });
      const { status, error, message } = response;
      if (status === STATUS_SUCCESS) {
        onDatasetDirUpdate();
      } else {
        isSuccessList[idx] = false;
        errorToastMessage(error, message);
      }
      if (idx === files.length - 1) {
        setToggledClearRows(!toggledClearRows);
        setDecompressing(false);
      }
      return response;
    });

    const progressList = files.map((file, idx) => {
      // if (f.status !== STATUS_SUCCESS) return false;
      const progressRate = new ReqInstance(async () => {
        if (isSuccessList[idx] === true) {
          const response = await callApi({
            url: `datasets/decompression_check?dataset_id=${datasetId}&path=${loc}&files=${file}`,
            method: 'get',
          });

          const { result, status } = response;
          // status가 success일때는 계속 확인
          if (status === STATUS_SUCCESS) {
            if (result >= 100) {
              toast.success(`Successfully decompressed the file ${file}.`);
              return { title: file, rate: result, done: true };
            }
            return { title: file, rate: result };
          }
          return false;
        } else {
          dispatch(deleteProgressList(file));
        }
      }, file);

      return progressRate;
    });

    dispatch(openProgressList(progressList));
  };

  /**
   * 이전 데이터 미리보기
   * @param {number} previewIndex 현재 미리보기 데이터 index
   */
  const showPrevData = (previewIndex) => {
    if (previewIndex === 0) {
      toast.info(t('previewFirstData.message'));
      return;
    }
    const index = previewIndex - 1;
    for (let i = index; i >= 0; i--) {
      if (fileList[i].type === 'file' && fileList[i].is_preview) {
        onPreview(fileList[i].name, i);
        break;
      }
    }
  };

  /**
   * 다음 데이터 미리보기
   * @param {number} previewIndex 현재 미리보기 데이터 index
   */
  const showNextData = (previewIndex) => {
    if (previewIndex === fileList.length - 1) {
      toast.info(t('previewLastData.message'));
      return;
    }
    const index = previewIndex + 1;
    for (let i = index; i < fileList.length; i++) {
      if (fileList[i].type === 'file' && fileList[i].is_preview) {
        onPreview(fileList[i].name, i);
        break;
      }
    }
  };

  /**
   * 파일 미리보기
   *
   * @param {string} name 파일 이름
   */
  const onPreview = async (name, index) => {
    const fileListIndex = index;
    const loc = `${path.join('/')}/`;
    // 데이터를 받아오기 전에 먼저 모달을 띄워서 로딩을 보여준 뒤 데이터가 오면 대체함
    dispatch(
      openModal({
        modalType: 'PREVIEW',
        modalData: {
          submit: {
            text: 'confirm.label',
            func: () => {
              dispatch(closeModal('PREVIEW'));
            },
          },
          index: fileListIndex,
          fileName: name,
          fileType: null,
          previewData: null,
          showPrevData,
          showNextData,
        },
      }),
    );
    const response = await network.callApiWithPromise({
      url: `datasets/preview?dataset_id=${datasetId}&file_name=${encodeURIComponent(
        name,
      )}&path=${loc}`,
      method: 'get',
    });
    const { status, data } = response;
    if (status === 200) {
      if (data.status === 0) {
        errorToastMessage(data.error, data.message);
      } else {
        dispatch(
          openModal({
            modalType: 'PREVIEW',
            modalData: {
              submit: {
                text: 'confirm.label',
                func: () => {
                  dispatch(closeModal('PREVIEW'));
                },
              },
              index: fileListIndex,
              fileName: name,
              fileType: data.result.type,
              previewData: data.result.data,
              showPrevData,
              showNextData,
            },
          }),
        );
      }
    } else {
      toast.error(t('dataset.012.error.message'));
    }
    return false;
  };

  /**
   * API 호출 PUT
   * 데이터셋 삭제
   */
  const onDelete = async () => {
    setDeleting(true);

    const form = new FormData();
    form.append('dataset_id', datasetId);
    form.append('dataset_name', datasetName);
    form.append('workspace_id', workspaceId);
    form.append('workspace_name', workspaceName);
    const loc = `${path.join('/')}/`;
    for (let i = 0; i < selectedRows.length; i += 1) {
      const { name } = selectedRows[i];
      form.append('remove_files', `${loc}${name}`);
    }
    const response = await upload({
      url: `datasets/${datasetId}/files`,
      method: 'put',
      form,
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setToggledClearRows(!toggledClearRows);
      defaultSuccessToastMessage('delete');
      onDatasetDirUpdate();
    } else {
      errorToastMessage(error, message);
    }
    setDeleting(false);
  };

  /**
   * row 클릭 이벤트
   * 데이터셋 폴더 클릭시 파일 목록으로 이동
   *
   * @param {object} e 클릭한 데이터셋 폴더/파일 데이터
   */
  const onRowClick = (e) => {
    const { type, name: dir } = e;
    if (type !== 'dir') return;

    const prevHistory = [...historyVal];

    const newPath = [...path, dir];
    const history = [...prevHistory];
    const pathInputVal = newPath[0] === '/' ? '/' : newPath.join('/');

    history.push({ path: newPath, page: 1, pathInputVal });

    setPage(1);
    setPath(newPath);
    setPathInputVal(pathInputVal);
    setHistoryVal(history);
    setHistoryTmp([]);
    setPaginationResetDefaultPage(!paginationResetDefaultPage);

    const pathData = {
      page: 1,
      path: newPath,
    };

    getDatasetDetail(pathData);
  };

  /**
   * 데이터셋 경로 변경 핸들러
   *
   * @param {object} item {label: '', value: ''}
   */
  const pathChangeHandler = (item) => {
    const { value } = item;
    setPathHandler(value);
  };

  /**
   * 데이터셋 경로 이벤트 핸들러
   *
   * @param {object} e
   * @returns
   */
  const pathClickHandler = (e) => {
    if (e.key !== 'Enter') return;
    const value = e.target.value;
    setPathHandler(value);
  };

  /**
   * 데이터셋 경로 설정
   *
   * @param {string} path 데이터셋 경로
   */
  const setPathHandler = (path) => {
    setPathInputVal(path === '' ? '/' : path);

    const prevHistory = JSON.parse(JSON.stringify(historyVal));
    const newPath = path.split('/');

    if (newPath[newPath.length - 1] === '') newPath.pop();
    if (newPath.length === 0) newPath.push('/');

    setPath(newPath);

    // history 추가
    const history = [...prevHistory];
    history.push({ path: newPath, page: 1, pathInputVal: newPath.join('/') });

    setHistoryVal(history);
    setHistoryTmp([]);
    setPaginationResetDefaultPage(!paginationResetDefaultPage);

    // 마지막 문자가 '/'가 아니면 추가해줌
    // if (lastChar !== '/') setPathInputVal(pathInputVal);
    // getDatasetDetail();

    getDatasetDetail({ path: newPath });
  };

  /**
   * 데이터셋 경로 뒤로 이동
   */
  const historyBack = async () => {
    const prevHistory = JSON.parse(JSON.stringify(historyVal));

    if (prevHistory.length === 1) return;

    const history = JSON.parse(JSON.stringify(prevHistory));

    const tmpItem = history.pop();

    const newHistoryTmp = [...historyTmp];

    newHistoryTmp.push(tmpItem);

    let { path, page, pathInputVal } = history[history.length - 1];
    if (pathInputVal === '') pathInputVal = '/';

    setPath(path);
    setPage(page);
    setPathInputVal(pathInputVal);
    setHistoryVal(history);
    setHistoryTmp(newHistoryTmp);
    setPaginationResetDefaultPage(!paginationResetDefaultPage);

    const pathData = {
      path,
      page,
    };
    getDatasetDetail(pathData);
  };

  /**
   * 데이터셋 경로 앞으로 이동
   */
  const historyForward = () => {
    const prevHistory = [...historyVal];

    const prevHistoryTmp = [...historyTmp];

    if (prevHistoryTmp.length === 0) return;
    const history = [...prevHistory];
    const newHistoryTmp = [...prevHistoryTmp];
    const newPath = newHistoryTmp.pop();
    history.push(newPath);

    const { path, page, pathInputVal } = newPath;

    setPath(path);
    setPage(page);
    setPathInputVal(pathInputVal);
    setHistoryVal(history);
    setHistoryTmp(newHistoryTmp);
    setPaginationResetDefaultPage(!paginationResetDefaultPage);

    const pathData = {
      path,
      page,
    };

    getDatasetDetail(pathData);
  };

  /**
   * 이동/복사 - 목적 경로 선택 이벤트 핸들러
   *
   * @param {string} path 경로
   */
  const pathSelectHandler = (path) => {
    setDestinationPath(path);
  };

  /**
   * 이동/복사 - 새폴더 입력 이벤트 핸들러
   *
   * @param {*} e 텍스트 인풋 이벤트
   */
  const pathInputHandler = (e) => {
    const path = e.target.value;
    setNewFolder(path);
  };

  /**
   * 이동/복사 - 복사본 만들기 체크박스 이벤트 핸들러
   *
   * @param {object} e 체크박스 이벤트
   */
  const isCopyCheckHandler = (e) => {
    const checked = e.target.checked;
    setIsCopy(checked);
  };

  /**
   * 데이터셋 이동/복사
   */
  const onConfirmMoveCopy = async () => {
    let destPath = destinationPath;

    if (newFolder !== '') {
      destPath =
        destinationPath !== '/'
          ? `${destinationPath}/${newFolder}`
          : `/${newFolder}`;
    }

    const loc = `${path.join('/')}/`;
    const files = selectedRows.map(({ name }) => name);

    const body = {
      dataset_id: Number(datasetId),
      target_path: loc,
      destination_path: destPath,
      name: files.join(' '),
      is_copy: Number(isCopy),
    };

    const response = await callApi({
      url: 'datasets/copy_or_carry',
      method: 'post',
      body,
    });

    const { message, status, error } = response;

    if (status === STATUS_SUCCESS) {
      onDatasetDirUpdate();
      defaultSuccessToastMessage('change');
    } else {
      errorToastMessage(error, message);
    }
    // 초기화
    setDestinationPath('');
    setNewFolder('');
    setIsCopy(false);
    setToggledClearRows(!toggledClearRows);
  };

  const onCancelMoveCopy = () => {
    // 초기화
    setDestinationPath('');
    setNewFolder('');
    setIsCopy(false);
  };

  /**
   * 데이터 업로드 후 Dataset dir 내용 업데이트
   */
  const onDatasetDirUpdate = async () => {
    await getDatasetDetail();
    // await getDatasetDirList();
    setToggledClearRows(!toggledClearRows);
  };

  /**
   * 데이터셋 동기화
   * @returns boolean
   */
  const datasetSynchronization = useCallback(async () => {
    if (!loading[datasetId]) {
      dispatch(openMultiLoading(datasetId));
      const isSync = await syncInfo();
      if (isSync === false) {
        return false;
      }
      const isSyncSuccess = await checkSyncThread();
      if (isSyncSuccess === false) {
        return false;
      }
      dispatch(closeMultiLoading(datasetId));
      return true;
    }
  }, [checkSyncThread, datasetId, dispatch, loading, syncInfo]);

  /**
   * 새로고침
   */
  const onSync = async () => {
    const isSync = await datasetSynchronization();
    if (isSync === false) {
      return;
    }
    getDatasetInfo();
  };

  useComponentDidMount(
    useCallback(async () => {
      await getDatasetInfo(true);
      getSearchData({});
      await getDatasetDirList();
      await checkSyncThread(true);
    }, [checkSyncThread, getDatasetDirList, getDatasetInfo, getSearchData]),
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <DatasetDetailContent
      tableLoading={tableLoading}
      workspaceName={workspaceName}
      datasetName={datasetName}
      datasetDesc={datasetDesc}
      dirCount={dirCount}
      fileCount={fileCount}
      totalFileCount={totalFileCount}
      totalSize={totalSize}
      accessType={accessType}
      fileList={fileList}
      toggledClearRows={toggledClearRows}
      keyword={keyword}
      searchKey={searchKey}
      fileType={fileType}
      tree={tree}
      path={path}
      permissionLevel={permissionLevel}
      newFolder={newFolder}
      datasetId={datasetId}
      pathChangeHandler={pathChangeHandler}
      pathClickHandler={pathClickHandler}
      pathInputVal={pathInputVal}
      setPath={setPathHandler}
      refreshLoading={loading[datasetId]}
      onSelect={onSelect}
      onSearch={onSearch}
      onClear={onClear}
      onUpdate={onUpdate}
      onUpdateName={onUpdateName}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      onSearchKeyChange={(value) => {
        selectInputHandler('searchKey', value);
      }}
      openDeleteConfirmPopup={openDeleteConfirmPopup}
      onTypeChange={(value) => {
        selectInputHandler('fileType', value);
      }}
      goBack={goBack}
      onRowClick={onRowClick}
      downloading={downloading}
      onDecompressFile={onDecompressFile}
      disabledDecompress={disabledDecompress}
      decompressing={decompressing}
      deleting={deleting}
      autoLabelingProgress={autoLabelingProgress}
      historyBack={historyBack}
      paginationResetDefaultPage={paginationResetDefaultPage}
      historyForward={historyForward}
      onFileUpload={onFileUpload}
      onCreateFolder={onCreateFolder}
      onFileDownload={onFileDownload}
      onGoogleDriveUpload={onGoogleDriveUpload}
      onGitHubClone={onGitHubClone}
      onPreview={onPreview}
      onSync={onSync}
      pathSelectHandler={pathSelectHandler}
      pathInputHandler={pathInputHandler}
      isCopyCheckHandler={isCopyCheckHandler}
      selectedRows={selectedRows}
      destinationPath={destinationPath}
      isCopy={isCopy}
      onConfirmMoveCopy={onConfirmMoveCopy}
      onCancelMoveCopy={onCancelMoveCopy}
      onDatabaseUpload={onDatabaseUpload}
    />
  );
}

export default DatasetDetailPage;
