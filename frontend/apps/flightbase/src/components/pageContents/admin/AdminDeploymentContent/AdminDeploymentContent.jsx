// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import AdminDeploymentDetail from './AdminDeploymentDetail';
import Table from '@src/components/molecules/Table';

// CSS module
import style from './AdminDeploymentContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function AdminDeploymentContent({
  columns,
  tableData,
  totalRows,
  searchKey,
  keyword,
  onSearchKeyChange,
  onSearch,
  onCreate,
  openDeleteConfirmPopup,
  deploymentStatus,
  onStatusChange,
  deploymentType,
  onDeploymentTypeChange,
  onSelect,
  deleteBtnDisabled,
  toggledClearRows,
  onClear,
  onRefresh,
  refresh,
  loading,
  onSortHandler,
}) {
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('allStatus.label'), value: 'all' },
    { label: t('deploymentRunning'), value: 'running' },
    { label: t('installing'), value: 'installing' },
    { label: t('stop'), value: 'stop' },
    { label: t('error'), value: 'error' },
  ];

  const deploymentTypeOptions = [
    { label: 'allModelType.label', value: 'all' },
    { label: 'Built-in', value: 'built-in' },
    { label: 'Custom', value: 'custom' },
  ];

  const searchOptions = [
    { label: 'deploymentName.label', value: 'deployment_name' },
    { label: 'workspace.label', value: 'workspace_name' },
    { label: 'owner.label', value: 'user_name' },
    { label: 'user.label', value: 'users' },
  ];

  const filterList = (
    <>
      <Button
        type='primary-light'
        size='medium'
        onClick={onRefresh}
        iconAlign='left'
        icon={
          refresh
            ? '/images/icon/spinner-1s-58.svg'
            : '/images/icon/ic-refresh-blue.svg'
        }
        customStyle={{ width: '100%' }}
      >
        {t('refresh.label')}
      </Button>
      <Selectbox
        size='medium'
        list={statusOptions}
        selectedItem={deploymentStatus}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
        onChange={onStatusChange}
      />
      <Selectbox
        size='medium'
        list={deploymentTypeOptions}
        selectedItem={deploymentType}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
        }}
        onChange={onDeploymentTypeChange}
        t={t}
      />
    </>
  );

  const topButtonList = (
    <>
      <Button type='primary' onClick={onCreate}>
        {t('createDeployment.label')}
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

  const ExpandedComponent = (row) => {
    return <AdminDeploymentDetail data={row.data} onRefresh={onRefresh} />;
  };

  return (
    <div id='AdminDeploymentContent'>
      <PageTitle>{t('deployments.label')}</PageTitle>
      <div className={cx('content')}>
        <Table
          columns={columns}
          data={tableData}
          totalRows={totalRows}
          topButtonList={topButtonList}
          bottomButtonList={tableData.length > 0 && bottomButtonList}
          ExpandedComponent={ExpandedComponent}
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
          loading={loading && !refresh}
          onSortHandler={onSortHandler}
        />
      </div>
    </div>
  );
}

export default AdminDeploymentContent;
