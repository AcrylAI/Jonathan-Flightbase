// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import Table from '@src/components/molecules/Table';

// Icons
import loadingIcon from '@src/static/images/icon/spinner-1s-58.svg';
import syncIcon from '@src/static/images/icon/00-ic-basic-renew-blue.svg';

// CSS module
import style from './AdminDatasetContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function AdminDatasetContent({
  columns,
  tableData,
  tableLoading,
  totalRows,
  searchKey,
  keyword,
  onSearchKeyChange,
  onSearch,
  onCreate,
  openDeleteConfirmPopup,
  onSelect,
  onRowClick,
  deleteBtnDisabled,
  toggledClearRows,
  accessType,
  onAccessTypeChange,
  onAllSync,
  loading,
  onClear,
  onSortHandler,
}) {
  const { t } = useTranslation();

  const accessTypeOptions = [
    { label: t('allAccessType.label'), value: 'all' },
    { label: t('readAndWrite.label'), value: 1 },
    { label: t('readOnly.label'), value: 0 },
  ];

  const searchOptions = [
    { label: t('datasetName.label'), value: 'dataset_name' },
    { label: t('workspace.label'), value: 'workspace_name' },
    { label: t('creator.label'), value: 'owner' },
  ];

  const filterList = (
    <div className={cx('btn-filter')}>
      <Button
        type='primary-light'
        size='medium'
        onClick={onAllSync}
        iconAlign='left'
        icon={loading ? loadingIcon : syncIcon}
        customStyle={{ width: '100%' }}
      >
        {t('syncAll.label')}
      </Button>
      <Selectbox
        size='medium'
        list={accessTypeOptions}
        selectedItem={accessType}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
        onChange={onAccessTypeChange}
      />
    </div>
  );

  const topButtonList = (
    <>
      <Button type='primary' onClick={onCreate}>
        {t('createDataset.label')}
      </Button>
    </>
  );

  const bottomButtonList = (
    <>
      <Button
        type='red'
        onClick={openDeleteConfirmPopup}
        disabled={deleteBtnDisabled}
      >
        {t('delete.label')}
      </Button>
    </>
  );

  return (
    <div id='AdminDatasetContent'>
      <PageTitle>{t('datasets.label')}</PageTitle>
      <div className={cx('content')}>
        <Table
          columns={columns}
          data={tableData}
          loading={tableLoading}
          totalRows={totalRows}
          topButtonList={topButtonList}
          bottomButtonList={tableData.length > 0 && bottomButtonList}
          onRowClick={onRowClick}
          onSelect={onSelect}
          defaultSortField='create_datetime'
          toggledClearRows={toggledClearRows}
          filterList={filterList}
          searchOptions={searchOptions}
          searchKey={searchKey}
          keyword={keyword}
          onSearchKeyChange={onSearchKeyChange}
          onSearch={(e) => {
            onSearch(e.target.value);
          }}
          onClear={onClear}
          onSortHandler={onSortHandler}
        />
      </div>
    </div>
  );
}

export default AdminDatasetContent;
