import { useState, Fragment } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox, Badge } from '@jonathan/ui-react';
import Table from '@src/components/molecules/Table';
import DatasetFinder from './DatasetFinder';
import MarkerBtn from '@src/components/atoms/MarkerBtn';
import UploadButton from './UploadButton';
import DatasetMoveCopy from './DatasetMoveCopy';
import DatasetCheckModalContainer from '@src/components/Modal/DatasetCheckModal/DatasetCheckModalContainer';
import { toast } from '@src/components/Toast';
import SortColumn from '@src/components/molecules/Table/TableHead/SortColumn';
import useSortColumn from '@src/components/molecules/Table/TableHead/useSortColumn';

// Utils
import { numberWithCommas, convertBinaryByte } from '@src/utils';
import { convertLocalTime } from '@src/datetimeUtils';

// Icons
import loadingIcon from '@src/static/images/icon/spinner-1s-58.svg';
import syncIcon from '@src/static/images/icon/00-ic-basic-renew-blue.svg';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import classNames from 'classnames/bind';
import style from './DatasetDetailContent.module.scss';
const cx = classNames.bind(style);

const IS_MARKER = import.meta.env.VITE_REACT_APP_IS_MARKER === 'true';
const MARKER_VERSION = import.meta.env.VITE_REACT_APP_MARKER_VERSION;
const IS_DOWNLOAD =
  import.meta.env.VITE_REACT_APP_IS_DOWNLOAD_DATASET !== 'false';
const IS_PREVIEW =
  import.meta.env.VITE_REACT_APP_IS_PREVIEW_DATASET !== 'false';

function DatasetDetailContent({
  tableLoading,
  refreshLoading,
  workspaceName, // Workspace Name
  datasetName, // Dataset Name 값
  datasetDesc, // Dataset Description 값
  dirCount, // 폴더 전체 개수
  fileCount, // 현재 경로의 파일수
  totalFileCount, // 파일 전체 개수
  totalSize, // 파일 전체 사이즈
  accessType, // access type 값
  fileList, // 파일 목록
  onSelect, // 테이블의 row 체크박스 선택 이벤트
  toggledClearRows, // 해당 값이 바뀔 때 테이블에서 체크된 row 초기화 (모두 체크 해제)
  keyword, // 키워드
  datasetId,
  onSearchKeyChange,
  searchKey,
  fileType,
  permissionLevel,
  onSearch,
  onClear,
  onTypeChange,
  openDeleteConfirmPopup,
  selectedRows,
  onChangePage,
  onChangeRowsPerPage,
  onUpdate,
  onUpdateName,
  goBack,
  onRowClick,
  tree,
  path,
  pathChangeHandler,
  pathClickHandler,
  pathInputVal,
  setPath,
  historyBack,
  historyForward,
  paginationResetDefaultPage,
  onFileUpload, // 파일 업로드 이벤트
  onCreateFolder, // 폴더 생성 이벤트
  onGitHubClone, // 깃허브 클론 이벤트
  onGoogleDriveUpload, // 구글드라이브 업로드 이벤트
  onFileDownload, // 파일 다운로드 이벤트
  downloading, // 다운로드 중
  onDecompressFile, // 파일 압축해제 이벤트
  disabledDecompress, // 파일 압축해제 비활성화
  decompressing, // 파일 압축해제 중
  deleting, // 파일 삭제 중
  autoLabelingProgress,
  onPreview, // 파일 미리보기
  onSync, // 새로고침
  newFolder, // 이동/복사 새 폴더
  destinationPath, // 이동/복사 목적 경로
  pathSelectHandler, // 목적 경로 선택 이벤트 핸들러
  pathInputHandler, // 새폴더 입력 이벤트 핸들러
  isCopy, // 복사본 만들기 여부
  isCopyCheckHandler, // 복사본 만들기 이벤트 핸들러
  onConfirmMoveCopy, // 복사/이동 확인
  onCancelMoveCopy, // 복사/이동 취소
  onDatabaseUpload, // 한림대용 DB에서 가져오기
}) {
  const { t } = useTranslation();

  //state 적합성
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [datasetList, setDatasetList] = useState([]);
  const { sortClickFlag, onClickHandler, clickedIdx, clickedIdxHandler } =
    useSortColumn(3);
  const datasetCheckCloseHandler = () => {
    setDatasetOpen(false);
  };

  /**
   * 데이터셋 업로드 임시 폴더 이름
   * 해당 폴더 이름 변경(수정) 불가, 삭제 가능
   * 폴더 안에서는 업로드/생성 불가, 다운로드/삭제 가능
   */
  const tempFolderName = '.jf_tmp';
  const isTempPath = path[1] === tempFolderName;

  /**
   * 권한에 따라 버튼 비활성화
   */
  const isDisabledBtn =
    (Number(accessType) === 1 && Number(permissionLevel) > 4) ||
    (Number(accessType) === 0 && Number(permissionLevel) > 3);

  const searchOptions = [{ label: t('name.label'), value: 'name' }];

  const typeOptions = [
    { label: t('allType.label'), value: 'all' },
    { label: t('folder.label'), value: 'dir' },
    { label: t('file.label'), value: 'file' },
  ];

  /**
   * 적합성 검사 데이터 get
   */
  const getModelCheckData = async () => {
    const response = await callApi({
      url: `datasets/${datasetId}/built_in_model_compatibility`,
      method: 'GET',
    });

    const { result, status } = response;

    if (status === STATUS_SUCCESS) {
      setDatasetList(result);
    } else {
      toast.error('error');
    }
  };

  const onSortHandler = (selectedColumn, sortDirection, sortedRows) => {
    onClickHandler(clickedIdx, sortDirection);
  };

  const columns = [
    {
      name: t('type.label'),
      selector: 'type',
      sortable: false,
      maxWidth: '120px',
      cell: ({ type }) => {
        return (
          <span className={cx('type-column')}>
            <img
              src={
                type === 'dir'
                  ? '/images/icon/folder.svg'
                  : '/images/icon/file.svg'
              }
              alt='icon'
            />
            {type === 'dir' ? t('folder.label') : t('file.label')}
          </span>
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('name.label')}
          idx={0}
        />
      ),
      selector: 'name',
      sortable: true,
      minWidth: '160px',
      cell: (
        {
          type,
          name,
          autolabeling_status: autoLabelingStatus,
          is_preview: isPreview,
        },
        index,
      ) => {
        let labelTag = '';
        if (autoLabelingStatus) {
          const { progress, percent } = autoLabelingStatus;
          if (progress === 'in progress') {
            labelTag = (
              <Badge
                customStyle={{ marginLeft: '4px' }}
                label={`Auto-labeling-${percent}%`}
                type='green'
              />
            );
          } else if (progress === 'finish') {
            labelTag = (
              <Badge
                customStyle={{ marginLeft: '4px' }}
                label='Labeling-Done'
                type=''
              />
            );
          }
        }
        return (
          <>
            {type === 'dir' || !IS_PREVIEW ? (
              name
            ) : (
              <span
                className={isPreview ? 'preview-link' : ''}
                title={isPreview ? t('preview.title.label') : ''}
                onClick={() => {
                  isPreview && onPreview(name, index);
                }}
              >
                {name}
              </span>
            )}
            {labelTag}
          </>
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('size.label')}
          idx={1}
        />
      ),
      selector: 'size',
      sortable: true,
      maxWidth: '160px',
      cell: ({ size, type }) =>
        type === 'file' ? (
          <span title={`${numberWithCommas(size)} Bytes`}>
            {convertBinaryByte(size)}
          </span>
        ) : (
          ''
        ),
    },
    {
      name: t('modifier.label'),
      selector: 'modifier',
      sortable: false,
      maxWidth: '180px',
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
      selector: 'modified',
      sortable: true,
      maxWidth: '180px',
      cell: ({ modified }) => {
        return convertLocalTime(modified);
      },
    },
    {
      name: t('changeName.label'),
      minWidth: '130px',
      maxWidth: '140px',
      cell: (row) => (
        <img
          src='/images/icon/00-ic-basic-pen.svg'
          alt='change name'
          className='table-icon'
          style={{
            opacity: isDisabledBtn || row.name === tempFolderName ? 0.2 : 1,
          }}
          onClick={() => {
            if (!isDisabledBtn && row.name !== tempFolderName) {
              onUpdateName(row);
            }
          }}
        />
      ),
      button: true,
    },
  ];

  const filterList = (
    <Fragment>
      <Selectbox
        size='medium'
        list={typeOptions}
        selectedItem={fileType}
        onChange={onTypeChange}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
      />
    </Fragment>
  );

  const topButtonList = (
    <Fragment>
      <UploadButton
        onFileUpload={onFileUpload}
        onGoogleDrive={onGoogleDriveUpload}
        onGitHubClone={onGitHubClone}
        disabled={isDisabledBtn || isTempPath}
        onDatabaseUpload={onDatabaseUpload}
      />
      <Button
        type='primary'
        onClick={onCreateFolder}
        disabled={isDisabledBtn || isTempPath}
      >
        {t('folderCreate.label')}
      </Button>
    </Fragment>
  );

  const bottomButtonList = (
    <Fragment>
      <Button
        type='primary'
        onClick={onFileDownload}
        disabled={selectedRows.length === 0 || !IS_DOWNLOAD}
        loading={downloading}
      >
        {t('download.label')}
      </Button>
      <DatasetMoveCopy
        datasetName={datasetName}
        tree={tree}
        newFolder={newFolder}
        targetPath={path}
        destinationPath={destinationPath}
        pathSelectHandler={pathSelectHandler}
        pathInputHandler={pathInputHandler}
        isCopy={isCopy}
        isCopyCheckHandler={isCopyCheckHandler}
        confirmHandler={onConfirmMoveCopy}
        cancelHandler={onCancelMoveCopy}
        disabled={selectedRows.length === 0 || isDisabledBtn}
        tempFolderName={tempFolderName}
        btnCustomStyle={{ marginRight: '12px' }}
      />
      <Button
        type='primary'
        onClick={onDecompressFile}
        disabled={
          selectedRows.length === 0 ||
          disabledDecompress ||
          isDisabledBtn ||
          isTempPath
        }
        loading={decompressing}
      >
        {t('decompression.label')}
      </Button>
      <Button
        type='red'
        onClick={openDeleteConfirmPopup}
        disabled={selectedRows.length === 0 || isDisabledBtn}
        loading={deleting}
      >
        {t('delete.label')}
      </Button>
    </Fragment>
  );

  const DatasetFinderWrapper = () => (
    <DatasetFinder
      onChange={pathChangeHandler}
      onClick={pathClickHandler}
      setPath={setPath}
      tree={tree}
      value={pathInputVal}
      back={historyBack}
      forward={historyForward}
    />
  );
  // 적합성
  const datasetOpenHandler = () => {
    getModelCheckData();
    setDatasetOpen(!datasetOpen);
  };

  let datasetStatus = '';
  let datasetStatusText = '';
  if (autoLabelingProgress === 'in progress') {
    datasetStatus = 'active';
    datasetStatusText = 'autoLabelingProgress.message';
  } else if (autoLabelingProgress === 'finish') {
    datasetStatus = 'done';
    datasetStatusText = 'autoLabelingDone.message';
  }

  const reTest = (e) => {
    e.preventDefault(e);
  };
  return (
    <div
      id='DatasetDetailContent'
      className={cx('content')}
      onDrag={(e) => reTest(e)}
    >
      <div className={cx('info-header')}>
        <div className={cx('back-to-list')} onClick={() => goBack()}>
          <img
            className={cx('back-btn-image')}
            src='/images/icon/00-ic-basic-arrow-02-left.svg'
            alt='<'
          />
          <span className={cx('back-btn-label')}>
            {t('dataset.backToList.label')}
          </span>
        </div>
        <Button
          type='primary-light'
          onClick={() => {
            onSync();
          }}
          icon={refreshLoading ? loadingIcon : syncIcon}
          iconAlign='left'
        >
          {t('sync.label')}
        </Button>
      </div>
      <div className={cx('info-box')}>
        <div className={cx('left')}>
          <div>
            <div className={cx('dataset-name-box')}>
              <div className={cx('dataset-name')}>
                {t('detailsOf.label', { name: datasetName || '-' })}
              </div>
              {permissionLevel < 4 && (
                <img
                  src='/images/icon/00-ic-basic-pen.svg'
                  alt='<'
                  className={cx('edit-btn')}
                  onClick={() => onUpdate()}
                />
              )}
            </div>
            <div className={cx('dataset-description')}>
              {datasetDesc || '-'}
            </div>
          </div>
          <div className={cx('annotation')}>
            {IS_MARKER && permissionLevel > 1 && MARKER_VERSION === '1' && (
              <MarkerBtn
                workspaceName={workspaceName}
                datasetId={datasetId}
                datasetName={datasetName}
                disabled={totalFileCount === 0}
              />
            )}
            {datasetStatus !== '' && (
              <div className={cx('progress', datasetStatus)}>
                {t(datasetStatusText)}
              </div>
            )}
          </div>
        </div>
        <div className={cx('right')}>
          <div className={cx('dataset-info')}>
            <div className={cx('meta')}>
              <label>{t('accessType.label')}</label>
              <span>
                {Number(accessType) >= 0 ? (
                  Number(accessType) === 1 ? (
                    t('readAndWrite.label')
                  ) : (
                    t('readOnly.label')
                  )
                ) : (
                  <span className={cx('loading')}>Loading...</span>
                )}
              </span>
            </div>
            <div className={cx('meta')}>
              <label>{t('totalNumberOfFolders.label')}</label>
              <span>
                {Number(dirCount) >= 0 ? (
                  numberWithCommas(dirCount)
                ) : (
                  <span className={cx('loading')}>Loading...</span>
                )}
              </span>
            </div>
            <div className={cx('meta')}>
              <label>{t('totalNumberOfFiles.label')}</label>
              <span>
                {Number(totalFileCount) >= 0 ? (
                  numberWithCommas(totalFileCount)
                ) : (
                  <span className={cx('loading')}>Loading...</span>
                )}
              </span>
            </div>
            <div className={cx('meta')}>
              <label>{t('totalFileCapacity.label')}</label>
              <span>
                {Number(totalFileCount) >= 0 ? (
                  `${convertBinaryByte(totalSize)} 
                   (${numberWithCommas(totalSize)} Bytes)`
                ) : (
                  <span className={cx('loading')}>Loading...</span>
                )}
              </span>
            </div>
          </div>
          <div className={cx('dataset-check-box')}>
            <span className={cx('dataset-check-title')}>
              {t('builtInModelComplianceCheck.label')}
            </span>
            <div className={cx('drop-box')}>
              <Button
                type='primary-light'
                iconAlign='right'
                icon={
                  datasetOpen
                    ? '/images/icon/00-ic-basic-arrow-02-up-blue.svg'
                    : '/images/icon/00-ic-basic-arrow-02-down-blue.svg'
                }
                customStyle={{ width: '140px' }}
                onClick={datasetOpenHandler}
              >
                {t('datasetCheck.label')}
              </Button>
              <div className={cx('check-modal-wrap')}>
                {datasetOpen && (
                  <DatasetCheckModalContainer
                    list={datasetList}
                    closeFunc={datasetCheckCloseHandler}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Table
        loading={tableLoading}
        finder={DatasetFinderWrapper}
        hideButtons={false}
        topButtonList={topButtonList}
        bottomButtonList={fileList.length > 0 && bottomButtonList}
        data={fileList}
        columns={columns}
        totalRows={fileCount}
        onRowClick={onRowClick}
        onSelect={onSelect}
        toggledClearRows={toggledClearRows}
        defaultSortField='modified'
        paginationServer
        onChangeRowsPerPage={onChangeRowsPerPage}
        onChangePage={onChangePage}
        searchOptions={searchOptions}
        searchKey={searchKey}
        keyword={keyword}
        onSearchKeyChange={onSearchKeyChange}
        filterList={filterList}
        onSearch={(e) => {
          onSearch(e.target.value);
        }}
        onClear={onClear}
        paginationResetDefaultPage={paginationResetDefaultPage}
        conditionalRowStyles={[
          {
            when: (row) => row.type !== 'dir',
            style: {
              cursor: 'default !important',
            },
          },
        ]}
        onSortHandler={onSortHandler}
      />
    </div>
  );
}

export default DatasetDetailContent;
