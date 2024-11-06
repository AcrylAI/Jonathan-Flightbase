import { useRef } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import settingImage from '@images/icon/ic-storage-setting.svg';
import PageTitle from '@src/components/atoms/PageTitle';
import StoragePieChart from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StoragePieChart/StoragePieChart';
import StorageTemplate from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageTemplate/StorageTemplate';
import StorageStack from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageStack/StorageStack';
import StorageList from '@src/components/pageContents/admin/AdminStorageContent/storageComponent/StorageList/StorageList';
import SubMenu from '@src/components/molecules/SubMenu';
import { Button, InputText, StatusCard } from '@jonathan/ui-react';

// Icons
import loadingIcon from '@src/static/images/icon/spinner-1s-58.svg';
import syncIcon from '@src/static/images/icon/00-ic-basic-renew-blue.svg';

// Utils
import { convertBinaryByte } from '@src/utils';

// CSS module
import style from './AdminStorageContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

function AdminStorageContent({
  distributionType,
  distributionHandler,
  createHandler,
  createType,
  totalData,
  getStorageData,
  tableData = {},
  originTableData,
  distributionTypeHandler,
  createTypeHandler,
  storageSettingOpen,
  textInputHandler,
  searchInputData,
  usageLoading,
  storageTotalSync,
  loading,
}) {
  const { t } = useTranslation();
  const scrollRef = useRef();

  const distributionOptions = [
    { label: 'all.label', value: 'all' },
    { label: 'allocate.label', value: 'allocate' },
    { label: 'share.label', value: 'share' },
  ];

  const createOptions = [
    { label: 'all.label', value: 'createAll' },
    { label: 'allowed.label', value: 'allow' },
    { label: 'limited.label', value: 'limit' },
  ];

  const scrollHandler = (idx) => {
    scrollRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={cx('container')}>
      <PageTitle>{t('storage.label')}</PageTitle>
      <div className={cx('top-title')}>
        <div className={cx('title')}>{t('totalStorageStatus.label')}</div>
        <div className={cx('sync')}>
          <Button
            type='primary-light'
            size='medium'
            onClick={storageTotalSync}
            iconAlign='left'
            icon={loading ? loadingIcon : syncIcon}
            customStyle={{ width: '100%' }}
          >
            {t('storageSync.label')}
          </Button>
        </div>
      </div>
      <StorageTemplate
        customStyle={{ minWidth: '730px' }}
        pieChartRender={
          <StoragePieChart
            title={t('totalStorageUsageStatus.label')}
            label={t('active')}
            totalData={totalData}
            total={
              totalData?.total_size === undefined ? 0 : totalData?.total_size
            }
            value={
              totalData?.total_used === undefined ? 0 : totalData?.total_used
            }
            used={convertBinaryByte(
              totalData?.total_used === undefined ? 0 : totalData?.total_used,
            )}
            totalSize={convertBinaryByte(
              totalData?.total_size === undefined ? 0 : totalData?.total_size,
            )}
          />
        }
        listRender={
          <StorageList
            listData={originTableData}
            columns={[
              {
                label: t('storageServer.label'),
                selector: 'logical_name',
                headStyle: {
                  flex: '1 1 200px',
                  color: '#747474',
                  paddingRight: '15px',
                },
                bodyStyle: {
                  flex: '1 1 200px',
                  fontSize: '12px',
                  boxSizing: 'contentBox',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '15px',
                },
              },
              {
                label: t('size.label'),
                selector: 'size',
                headStyle: { flex: '1 1 126px', color: '#747474' },
                bodyStyle: {
                  flex: '1 1 126px',
                  fontSize: '12px',
                },
                cell: ({ size }) => {
                  return convertBinaryByte(size === undefined ? 0 : size);
                },
              },
              {
                label: t('usage.label'),
                selector: 'usage',
                headStyle: { flex: '1 1 126px', color: '#747474' },
                bodyStyle: { flex: '1 1 126px', fontSize: '12px' },
                cell: ({ usage }) => {
                  return convertBinaryByte(
                    usage?.used === undefined ? 0 : usage?.used,
                  );
                },
              },
              {
                label: t('workspaceGeneration.label'),
                selector: 'create_lock',
                headStyle: { flex: '1 1 126px', color: '#747474' },
                bodyStyle: { flex: '1 1 126px', fontSize: '12px' },
                cell: ({ create_lock }) => {
                  return (
                    <StatusCard
                      text={
                        create_lock ? t('limited.label') : t('allowed.label')
                      }
                      status={create_lock ? 'red' : 'green'}
                      size='x-small'
                      customStyle={{
                        width: '31px',
                      }}
                    />
                  );
                },
              },
              {
                label: t('distributionType.label'),
                selector: 'share',
                headStyle: { flex: '1 1 126px', color: '#747474' },
                bodyStyle: { flex: '1 1 126px', fontSize: '12px' },
                cell: ({ share }) => {
                  return (
                    <StatusCard
                      text={share ? t('share.label') : t('allocate.label')}
                      status={share ? 'yellow' : 'orange'}
                      size='x-small'
                      customStyle={{
                        width: '31px',
                      }}
                    />
                  );
                },
              },
              {
                label: (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'start',
                    }}
                  >
                    <div className={cx('bullet-usage')}>
                      {t('usageRate.label')}
                    </div>
                    {/* <div className={cx('bullet-assign')}>
                      {t('allocationRate.label')}
                    </div> */}
                  </div>
                ),
                selector: 'usage',
                headStyle: { flex: '1 1 300px', color: '#747474' },
                bodyStyle: { flex: '1 1 300px', fontSize: '12px' },
                cell: ({ usage }) => {
                  return (
                    <StorageStack
                      usage={
                        usage?.pcent ? Number(usage?.pcent.split('%')[0]) : 0
                      }
                      allocation={
                        usage?.allocation_pcent
                          ? Number(usage.allocation_pcent.split('%')[0])
                          : 0
                      }
                    />
                  );
                },
              },
              {
                label: t('shortcut.label'),
                selector: 'g',
                headStyle: {
                  flex: '1 1 126px',
                  color: '#747474',
                  display: 'flex',
                  justifyContent: 'end',
                },
                bodyStyle: {
                  flex: '1 1 126px',
                  display: 'flex',
                  justifyContent: 'end',
                },
                cell: ({ id }) => {
                  return (
                    <Button
                      type='text-underline'
                      size={'x-small'}
                      onClick={() => {
                        scrollHandler(id);
                      }}
                      customStyle={{
                        padding: 0,
                      }}
                    >
                      {t('shortcut.label')}
                    </Button>
                  );
                },
              },
            ]}
          />
        }
      />
      <div className={cx('page-contents-bottom')}>
        <div className={cx('top-content')}>
          <div className={cx('top-title-box')}>
            <span className={cx('title')}>
              {t('individualStorageStatus.label')}
            </span>
            <div className={cx('sync')}>
              <Button
                type='primary-light'
                size='medium'
                onClick={() => getStorageData('sync')}
                iconAlign='left'
                icon={usageLoading ? loadingIcon : syncIcon}
                customStyle={{ width: '100%' }}
              >
                {t('storageUsageSync.label')}
              </Button>
            </div>
          </div>
          {/* <div className={cx('storage-buttons')}> */}
          <div className={cx('buttons-box')}>
            <div className={cx('distribution-type')}>
              <span className={cx('type-title')}>
                {t('distributionType.label')}
              </span>

              <div className={cx('menu-box')}>
                <SubMenu
                  option={distributionOptions}
                  select={distributionType}
                  onChangeHandler={(e) => {
                    distributionHandler(e);
                    distributionTypeHandler(e.value);
                  }}
                  customStyle={{ marginBottom: 0 }}
                />
              </div>
            </div>
            <div className={cx('create-type')}>
              <span className={cx('type-title')}>
                {t('workspaceGeneration.label')}
              </span>
              <div className={cx('menu-box')}>
                <SubMenu
                  option={createOptions}
                  select={createType}
                  onChangeHandler={(e) => {
                    createHandler(e);
                    createTypeHandler(e.value);
                  }}
                  customStyle={{ marginBottom: 0 }}
                />
              </div>
            </div>
            <div className={cx('search')}>
              <InputText
                customStyle={{
                  minWidth: '184px',
                }}
                closeIconStyle={{
                  left: '172px',
                  width: '20px',
                  height: '20px',
                  transform: 'translateY(-55%)',
                }}
                onChange={(e) => {
                  textInputHandler(e.target.value);
                }}
                t={t}
                placeholder={t('search.label')}
                disableLeftIcon={false}
              />
            </div>
          </div>
        </div>
        {/* </div> */}
        <div className={cx('bottom-content')} ref={scrollRef}>
          {(() => {
            let newTableData = JSON.parse(JSON.stringify(tableData));
            if (searchInputData) {
              newTableData = JSON.parse(JSON.stringify(searchInputData));
            }
            return newTableData?.length > 0 ? (
              // 배열에 넣기
              newTableData.map((storage, i) => {
                let totalWorkspaceUsed = 0;

                let allocationPcent = 0;
                let workspacePcent = 0;
                let additionalData = [];
                let convertSize = [];

                if (storage.share === 0) {
                  if (storage?.workspaces.length > 0) {
                    storage.workspaces.forEach((v) => {
                      if (v?.workspace_used) {
                        totalWorkspaceUsed =
                          totalWorkspaceUsed + Number(v.workspace_used);
                      }
                    });
                  }
                  let total = totalWorkspaceUsed;
                  let minusAllocate =
                    storage.size - storage.usage.allocate_used;
                  workspacePcent = (total / minusAllocate) * 100;
                  convertSize.push(
                    convertBinaryByte(storage.usage.used - totalWorkspaceUsed),
                  );
                  convertSize.push(
                    convertBinaryByte(storage.usage.allocate_used),
                  );
                  convertSize.push(convertBinaryByte(totalWorkspaceUsed));

                  allocationPcent =
                    (storage.usage.allocate_used / Number(storage.usage.size)) *
                    100;

                  const nonJonathan = Math.round(
                    ((storage.usage.used - totalWorkspaceUsed) /
                      Number(storage.usage.size)) *
                      100,
                  );

                  totalWorkspaceUsed = Math.round(
                    (totalWorkspaceUsed / Number(storage.usage.size)) * 100,
                  );
                  const labelArray = [
                    'nonJonathanUsage.label',
                    'active',
                    'allocated.label',
                  ];
                  const colorArray = ['#7E7E7F', '#2D76F8', '#C8DBFD'];
                  const valueArray = [
                    nonJonathan,
                    workspacePcent,
                    allocationPcent,
                  ];

                  labelArray.forEach((v, i) => {
                    additionalData.push({
                      label: v,
                      color: colorArray[i],
                      value: valueArray[i],
                      size: convertSize[i],
                    });
                  });
                }
                let pcent = Number(storage.usage.pcent?.split('%')[0]);
                if (storage.share === 0) {
                  pcent = Number(storage.usage.allocate_pcent?.split('%')[0]);
                }

                const header = (
                  <div
                    className={cx('header-container')}
                    ref={(el) => {
                      if (el) {
                        scrollRef.current[storage.id] = el;
                      }
                    }}
                    key={storage.id}
                  >
                    <div className={cx('left-contents')}>
                      <div className={cx('name')}>{storage.logical_name}</div>
                      <div className={cx('create')}>
                        {t('workspaceGeneration.label')}
                        <StatusCard
                          text={
                            storage?.create_lock
                              ? t('limited.label')
                              : t('allowed.label')
                          }
                          status={storage?.create_lock ? 'red' : 'green'}
                          size='x-small'
                          customStyle={{
                            width: '31px',
                            marginLeft: '8px',
                          }}
                        />
                      </div>
                      <div className={cx('type')}>
                        {t('distributionType.label')}
                        <StatusCard
                          text={
                            storage?.share
                              ? t('share.label')
                              : t('allocate.label')
                          }
                          status={storage?.share ? 'yellow' : 'orange'}
                          size='x-small'
                          customStyle={{
                            width: '31px',
                            marginLeft: '8px',
                          }}
                        />
                      </div>
                    </div>
                    <div className={cx('right-contents')}>
                      <div className={cx('setting')}>
                        <Button
                          type='none-boreder'
                          size='medium'
                          onClick={() => {
                            storageSettingOpen({
                              name: storage.logical_name,
                              id: storage.id,
                              share: storage.share,
                              create_lock: storage.create_lock,
                              workspaces: storage.workspaces?.length,
                            });
                          }}
                          iconAlign='left'
                          customStyle={{ width: '100%' }}
                          icon={settingImage}
                        >
                          {t('storageSettings.label')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );

                const columns =
                  storage.share === 0
                    ? Array.from({ length: 5 }, () => ({}))
                    : Array.from({ length: 4 }, () => ({}));
                columns[0] = {
                  label: t('workspace.label'),
                  selector: 'workspace_name',
                  headStyle: {
                    flex: '1 1 200px',
                    color: '#747474',
                    paddingRight: '30px',
                  },
                  bodyStyle: {
                    flex: '1 1 200px',
                    fontSize: '12px',
                    boxSizing: 'contentBox',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '30px',
                  },
                };
                if (storage.share === 0) {
                  // 할당형
                  columns[1] = {
                    label: t('allocationCapacity.label'),
                    headStyle: { flex: '1 1 150px', color: '#747474' },
                    bodyStyle: {
                      flex: '1 1 150px',
                      fontSize: '12px',
                    },
                    cell: ({ workspace_size }) => {
                      const number = Number(workspace_size);
                      if (number !== undefined) {
                        return convertBinaryByte(number);
                      }
                      return convertBinaryByte(0);
                    },
                  };
                  columns[2] = {
                    label: t('usedCapacity'),
                    headStyle: { flex: '1 1 150px', color: '#747474' },
                    bodyStyle: { flex: '1 1 150px', fontSize: '12px' },
                    cell: ({ workspace_used }) => {
                      const number = Number(workspace_used);
                      if (number !== undefined) {
                        return convertBinaryByte(number);
                      }
                      return convertBinaryByte(0);
                    },
                  };
                  columns[3] = {
                    label: t('storageRemaining.modal.label'),
                    headStyle: { flex: '1 1 150px', color: '#747474' },
                    bodyStyle: { flex: '1 1 150px', fontSize: '12px' },
                    cell: ({ workspace_avail }) => {
                      const number = Number(workspace_avail);
                      if (number !== undefined) {
                        return convertBinaryByte(number);
                      }
                      return convertBinaryByte(0);
                    },
                  };

                  columns[4] = {
                    label: (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'start',
                        }}
                      >
                        <div className={cx('bullet-usage')}>
                          {t('usageRate.label')}
                        </div>
                      </div>
                    ),
                    headStyle: { flex: '1 1 300px', color: '#747474' },
                    bodyStyle: { flex: '1 1 300px', fontSize: '12px' },
                    cell: ({ workspace_pcent }) => (
                      <StorageStack
                        usage={
                          workspace_pcent
                            ? Number(workspace_pcent.split('%')[0])
                            : 0
                        }
                      />
                    ),
                  };
                } else {
                  // 공유형
                  columns[1] = {
                    label: t('usedCapacity'),
                    headStyle: { flex: '1 1 150px', color: '#747474' },
                    bodyStyle: { flex: '1 1 150px', fontSize: '12px' },
                    cell: ({ workspace_used }) => {
                      const number = Number(workspace_used);
                      if (number !== undefined) {
                        return convertBinaryByte(number);
                      }
                      return convertBinaryByte(0);
                    },
                  };
                  columns[2] = {
                    label: t('storageRemaining.modal.label'),
                    headStyle: { flex: '1 1 150px', color: '#747474' },
                    bodyStyle: { flex: '1 1 150px', fontSize: '12px' },
                    cell: ({ workspace_avail }) => {
                      const number = Number(workspace_avail);
                      if (number !== undefined) {
                        return convertBinaryByte(number);
                      }
                      return convertBinaryByte(0);
                    },
                  };

                  columns[3] = {
                    label: (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'start',
                        }}
                      >
                        <div className={cx('bullet-usage')}>
                          {t('usageRate.label')}
                        </div>
                        <div className={cx('bullet-all-usage')}>
                          {t('all.label')} {t('usageRate.label')}
                        </div>
                      </div>
                    ),
                    headStyle: { flex: '1 1 300px', color: '#747474' },
                    bodyStyle: { flex: '1 1 300px', fontSize: '12px' },
                    cell: ({ workspace_pcent, workspace_used }) => {
                      const currentWorkspaceUsage = Math.ceil(
                        (workspace_used / storage.size) * 100,
                      );
                      return (
                        <StorageStack
                          usage={currentWorkspaceUsage}
                          allocation={
                            workspace_pcent
                              ? Number(workspace_pcent?.split('%')[0])
                              : 0
                          }
                        />
                      );
                    },
                  };
                }
                return (
                  <div key={storage?.id}>
                    <StorageTemplate
                      pieChartRender={
                        <StoragePieChart
                          label={t('active')}
                          total={100}
                          value={pcent}
                          used={convertBinaryByte(
                            storage.usage.used === undefined
                              ? 0
                              : storage.share === 1
                              ? storage.usage.used
                              : storage.usage.allocate_used,
                          )}
                          totalSize={convertBinaryByte(
                            storage.usage.size === undefined
                              ? 0
                              : storage.usage.size,
                          )}
                          additionalData={storage.share === 0 && additionalData}
                        />
                      }
                      header={header}
                      listRender={
                        <StorageList
                          listData={storage?.workspaces}
                          columns={columns}
                        />
                      }
                    />
                  </div>
                );
              })
            ) : (
              <div className={cx('empty')}>{t('storageListEmpty.message')}</div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default AdminStorageContent;
