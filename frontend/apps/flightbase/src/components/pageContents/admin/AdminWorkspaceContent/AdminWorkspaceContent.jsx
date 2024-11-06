// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import Table from '@src/components/molecules/Table';
import AdminWorkspaceDetail from './AdminWorkspaceDetail';

// CSS module
import style from './AdminWorkspaceContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function AdminWorkspaceContent({
  columns,
  tableData,
  totalRows,
  searchKey,
  keyword,
  onSearchKeyChange,
  onSearch,
  onCreate,
  openDeleteConfirmPopup,
  workspaceStatus,
  onStatusChange,
  onSelect,
  deleteBtnDisabled,
  toggledClearRows,
  moreList,
  onClear,
  onSortHandler,
}) {
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('allStatus.label'), value: 'all' },
    { label: t('active'), value: 'active' },
    { label: t('reserved'), value: 'reserved' },
    { label: t('expired'), value: 'expired' },
  ];

  const searchOptions = [
    { label: t('workspaceName.label'), value: 'name' },
    { label: t('workspaceManager.label'), value: 'manager' },
    { label: t('user.label'), value: 'user' },
  ];

  const filterList = (
    <>
      <Selectbox
        size='medium'
        list={statusOptions}
        selectedItem={workspaceStatus}
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
    </>
  );

  const topButtonList = (
    <>
      <Button type='primary' onClick={onCreate}>
        {t('createWorkspace.label')}
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
    return <AdminWorkspaceDetail data={row.data} moreList={moreList} />;
  };

  return (
    <div id='AdminWorkspaceContent'>
      <PageTitle>{t('workspaces.label')}</PageTitle>
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
          onSortHandler={onSortHandler}
        />
      </div>
    </div>
  );
}

export default AdminWorkspaceContent;
