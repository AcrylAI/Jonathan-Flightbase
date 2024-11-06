// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import Table from '@src/components/molecules/Table';
import Tab from '@src/components/molecules/Tab';
import AdminUserDetail from './AdminUserDetail';
import AdminGroupDetail from './AdminGroupDetail';

// CSS module
import style from './AdminUserContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function AdminUserContent({
  columns,
  tableData,
  totalRows,
  searchKey,
  keyword,
  onSearchKeyChange,
  onSearch,
  onCreate,
  openDeleteConfirmPopup,
  userType,
  onTypeChange,
  onSelect,
  deleteBtnDisabled,
  toggledClearRows,
  moreList,
  tabHandler,
  tabOptions,
  tab,
  onClear,
  onSortHandler,
  onRecoverUsers,
}) {
  const { t } = useTranslation();

  const typeOptions = [
    { label: t('allUserType.label'), value: 'all' },
    { label: t('admin.label'), value: 0 },
    { label: t('workspaceManager.label'), value: 1 },
    { label: t('trainingOwner.label'), value: 2 },
    { label: t('user.label'), value: 3 },
  ];

  const searchOptions = [{ label: t('userID.label'), value: 'name' }];
  const groupSearchOptions = [{ label: t('groupName.label'), value: 'name' }];

  const filterList = (
    <>
      <Selectbox
        size='medium'
        list={typeOptions}
        selectedItem={userType}
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
        {tab.value === 0 ? t('addUser.label') : t('addGroup.label')}
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
      {tab.value === 0 && (
        <Button type='red-light' onClick={onRecoverUsers}>
          {t('userID.recover.label')}
        </Button>
      )}
    </>
  );

  const ExpandedComponent = (row) => {
    return tab.value === 0 ? (
      <AdminUserDetail data={row.data} moreList={moreList} />
    ) : (
      <AdminGroupDetail
        data={row.data}
        description={row.data.description}
        name={row.data.name}
        userNameList={row.data.user_name_list}
      />
    );
  };
  return (
    <div className={cx('content')}>
      <PageTitle>{t('users.label')}</PageTitle>
      <div className={cx('tab-container')}>
        <Tab tabHandler={tabHandler} option={tabOptions} select={tab} />
      </div>
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
        selectableRowDisabled={({ name }) => {
          return name === 'root';
        }}
        filterList={tab.value === 0 ? filterList : null}
        searchOptions={tab.value === 0 ? searchOptions : groupSearchOptions}
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
  );
}

export default AdminUserContent;
