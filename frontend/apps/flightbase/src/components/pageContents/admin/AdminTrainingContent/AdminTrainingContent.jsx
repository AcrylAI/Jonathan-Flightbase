// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import Table from '@src/components/molecules/Table';
import AdminTrainingDetail from './AdminTrainingDetail';
import FederatedLearningBtn from '@src/components/molecules/FederatedLearningBtn';

// CSS module
import style from './AdminTrainingContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const IS_FL = import.meta.env.VITE_REACT_APP_IS_FEDERATED_LEARNING === 'true';

function AdminTrainingContent({
  columns,
  tableData,
  totalRows,
  searchKey,
  keyword,
  onSearchKeyChange,
  onSearch,
  onCreate,
  openDeleteConfirmPopup,
  trainingStatus,
  onStatusChange,
  trainingType,
  onTypeChange,
  onSelect,
  deleteBtnDisabled,
  toggledClearRows,
  moveJupyterLink,
  onJupyterControl,
  jobStop,
  onClear,
  onRefresh,
  refresh,
  loading,
  onSortHandler,
}) {
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('allStatus.label'), value: 'all' },
    { label: t('trainingRunning'), value: 'running' },
    { label: t('pending'), value: 'pending' },
    { label: t('stop'), value: 'stop' },
    { label: t('expired'), value: 'expired' },
  ];

  const typeOptions = [
    { label: t('allType.label'), value: 'all' },
    { label: 'Custom', value: 'advanced' },
    { label: 'Built-in', value: 'built-in' },
  ];

  const searchOptions = [
    { label: t('trainingName.label'), value: 'training_name' },
    { label: t('workspace.label'), value: 'workspace_name' },
    { label: t('owner.label'), value: 'user_name' },
    { label: t('user.label'), value: 'users' },
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
        selectedItem={trainingStatus}
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
        list={typeOptions}
        selectedItem={trainingType}
        customStyle={{
          selectboxForm: {
            width: '184px',
          },
          listForm: {
            width: '184px',
          },
        }}
        onChange={onTypeChange}
      />
    </>
  );

  const topButtonList = (
    <>
      <Button type='primary' onClick={onCreate}>
        {t('createTraining.label')}
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
    return (
      <AdminTrainingDetail
        data={row.data}
        moveJupyterLink={moveJupyterLink}
        onJupyterControl={onJupyterControl}
        jobStop={jobStop}
        tableData={tableData}
        getTrainingsData={onRefresh}
      />
    );
  };

  return (
    <div id='AdminTrainingContent'>
      <PageTitle>{t('trainings.label')}</PageTitle>
      {IS_FL && <div className={cx('fl-box')}><FederatedLearningBtn /></div>}
      <div className={cx('content', IS_FL && 'fl')}>
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

export default AdminTrainingContent;
