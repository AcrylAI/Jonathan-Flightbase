import { useMemo } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import Table from '@src/components/molecules/Table';
import UserDockerImageDetail from './UserDockerImageDetail';

// CSS module
import style from './UserDockerImageContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const uploadTypeOptions = [
  { label: 'allCreateType.label', value: 'all' },
  { label: 'Built-in', value: 0 },
  { label: 'Pull', value: 1 },
  { label: 'Tar', value: 2 },
  { label: 'Dockerfile Build', value: 3 },
  { label: 'Tag', value: 4 },
  { label: 'NGC', value: 5 },
  { label: 'Commit', value: 6 },
];

const releaseTypeOptions = [
  { label: 'allReleaseType.label', value: 'all' },
  { label: 'workspace.label', value: 0 },
  { label: 'global.label', value: 1 },
];

const searchOptions = [
  { label: 'dockerImageName.label', value: 'image_name' },
  { label: 'creator.label', value: 'user_name' },
];

function UserDockerImageContent({
  columns,
  tableData,
  totalRows,
  searchKey,
  onSearchKeyChange,
  keyword,
  onSearch,
  onSelect,
  toggledClearRows,
  onCreate,
  onClear,
  deleteBtnDisabled,
  openDeleteConfirmPopup,
  uploadType,
  onUploadTypeChange,
  releaseType,
  onReleaseTypeChange,
  onSortHandler,
}) {
  const { t } = useTranslation();

  const filterList = (
    <>
      <Selectbox
        size='medium'
        list={uploadTypeOptions}
        selectedItem={uploadType}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
        onChange={onUploadTypeChange}
        t={t}
      />
      <Selectbox
        size='medium'
        list={releaseTypeOptions}
        selectedItem={releaseType}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
        onChange={onReleaseTypeChange}
        t={t}
      />
    </>
  );

  const topButtonList = (
    <>
      <Button
        type='primary'
        onClick={onCreate}
        createBtnTestId='upload-docker-image-btn'
      >
        {t('createDockerImage.label')}
      </Button>
    </>
  );

  const bottomButtonList = (
    <>
      <Button
        type='red'
        onClick={openDeleteConfirmPopup}
        disabled={deleteBtnDisabled}
        openDeleteBtnTestId='open-delete-docker-modal-btn'
      >
        {t('delete.label')}
      </Button>
    </>
  );

  const ExpandedComponent = useMemo(() => {
    return (row) => <UserDockerImageDetail data={row.data} />;
  }, []);

  return (
    <div id='UserDockerImageContent' className={cx('wrapper')}>
      <PageTitle>{t('dockerImages.label')}</PageTitle>
      <div className={cx('content')}>
        <Table
          columns={columns}
          data={tableData}
          totalRows={totalRows}
          topButtonList={topButtonList}
          bottomButtonList={tableData.length > 0 && bottomButtonList}
          ExpandedComponent={ExpandedComponent}
          onSelect={onSelect}
          onClear={onClear}
          defaultSortField='create_datetime'
          toggledClearRows={toggledClearRows}
          filterList={filterList}
          selectableRowDisabled={({ has_permission: permission, status }) =>
            permission === 0 || status === 0 || status === 1 || status === 4
          }
          searchOptions={searchOptions}
          searchKey={searchKey}
          keyword={keyword}
          onSearchKeyChange={onSearchKeyChange}
          onSearch={(e) => {
            onSearch(e.target.value);
          }}
          onSortHandler={onSortHandler}
        />
      </div>
    </div>
  );
}

export default UserDockerImageContent;
