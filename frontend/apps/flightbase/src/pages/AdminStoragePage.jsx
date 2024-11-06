import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import AdminStorageContent from '@src/components/pageContents/admin/AdminStorageContent';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Utils
import { convertByte } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

import { errorToastMessage, successToastMessage } from '@src/utils';

function AdminStoragePage() {
  // Redux hooks
  const dispatch = useDispatch();
  const mountRef = useRef();

  const { t } = useTranslation();

  const [totalData, setTotalData] = useState(null);
  const [originTableData, setOriginTableData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [searchInputData, setSearchInputData] = useState(null);
  const [distributionType, setDistributionType] = useState({
    label: 'all.label',
    value: 'all',
  });
  const [totalGraphData, setTotalGraphData] = useState(null);

  const distributionHandler = (option) => {
    setDistributionType(option);
  };

  const [createType, setCreateType] = useState({
    label: 'all.label',
    value: 'createAll',
  });

  const createHandler = (option) => {
    setCreateType(option);
  };

  const getStorageData = useCallback(
    async (sync) => {
      const response = await callApi({
        url: 'storage',
        method: 'get',
      });
      if (sync) {
        setUsageLoading(true);
      }

      const { status, result, error, message } = response;
      if (status === STATUS_SUCCESS) {
        setTotalData(result.total);
        setTableData(result.list);
        setOriginTableData(result.list);

        const totalSize = convertByte(
          totalData?.total_size === undefined ? 0 : totalData?.total_size,
        )?.split(' TB')[0];
        const usedSize = convertByte(
          totalData?.total_used === undefined ? 0 : totalData?.total_used,
        )?.split(' TB')[0];

        setTotalGraphData({
          total: totalSize,
          data: [{ label: t('active'), value: usedSize }],
          label: t('active'),
          value: usedSize,
        });
      } else {
        setTotalData([]);
        setTableData([]);
        setOriginTableData([]);
        errorToastMessage(error, message);
      }
      if (sync) {
        setUsageLoading(false);
        // toast message 추가
      }
    },
    [t, totalData?.total_size, totalData?.total_used],
  );

  const distributionTypeHandler = (type) => {
    const searchedData = distributionTypeSearch(type);
    setTableData(searchedData);
  };

  const distributionTypeSearch = (type) => {
    let newStorageData = JSON.parse(JSON.stringify(originTableData));

    if (createType.value !== 'createAll') {
      if (createType.value === 'allow') {
        // * create - allow면
        newStorageData = newStorageData.filter(
          (list) => list.create_lock === 0,
        );
      } else if (createType.value === 'limit') {
        // * create - limit면
        newStorageData = newStorageData.filter(
          (list) => list.create_lock === 1,
        );
      }
    }

    switch (type) {
      case 'all':
        return newStorageData;

      case 'allocate':
        const allocationData = newStorageData.filter(
          (list) => list.share === 0,
        );
        return allocationData;

      case 'share':
        const shareData = newStorageData.filter((list) => list.share === 1);
        return shareData;

      default:
        return [];
    }
  };

  const createTypeHandler = (type) => {
    const searchedData = createTypeSearch(type);
    setTableData(searchedData);
  };

  const createTypeSearch = (type) => {
    let newStorageData = JSON.parse(JSON.stringify(originTableData));

    if (distributionType.value !== 'all') {
      if (distributionType.value === 'allocate') {
        // * distribution - allocate면
        newStorageData = newStorageData.filter((list) => list.share === 0);
      } else if (distributionType.value === 'share') {
        // * distribution - share면
        newStorageData = newStorageData.filter((list) => list.share === 1);
      }
    }
    switch (type) {
      case 'createAll':
        return newStorageData;

      case 'allow':
        const allowedData = newStorageData.filter(
          (list) => list.create_lock === 0,
        );
        return allowedData;

      case 'limit':
        const limitedData = newStorageData.filter(
          (list) => list.create_lock === 1,
        );
        return limitedData;

      default:
        return [];
    }
  };

  // 스토리지 수정 - 설정
  const settingStorage = useCallback(
    async ({ id, name, share, lock }) => {
      const body = {
        id: String(id),
        name,
        share,
        lock,
      };

      const response = await callApi({
        url: `storage/${id}`,
        method: 'PUT',
        body,
      });

      const { status, error, message } = response;

      if (status === STATUS_SUCCESS) {
        getStorageData();
        dispatch(closeModal('SETTING_STORAGE'));
        successToastMessage('Edit finish');
      } else {
        errorToastMessage(error, message);
      }
    },
    [dispatch, getStorageData],
  );

  /**
   * Storage 설정
   */
  const storageSettingOpen = useCallback(
    ({ name, id, share, create_lock, workspaces }) => {
      dispatch(
        openModal({
          modalType: 'SETTING_STORAGE',
          modalData: {
            submit: {
              text: 'create.label',
              func: ({ id, name, share, lock }) => {
                settingStorage({ id, name, share, lock });
              },
            },
            cancel: {
              text: 'cancel.label',
            },
            data: { name, id, share, create_lock, workspaces },
          },
        }),
      );
    },
    [dispatch, settingStorage],
  );

  const textInputHandler = (value) => {
    if (value === '') {
      distributionTypeHandler(distributionType.value);
      createTypeHandler(createType.value);

      setSearchInputData(null);
    } else {
      const searchedData = tableData.filter(
        (list) => list.logical_name.indexOf(value) !== -1,
      );
      setSearchInputData(searchedData);
    }
  };

  // 스토리지 동기화
  const storageTotalSync = useCallback(async () => {
    const response = await callApi({
      url: `storage/sync`,
      method: 'POST',
    });
    setLoading(true);
    const { status, error, message } = response;

    if (status === STATUS_SUCCESS) {
      setLoading(false);
      getStorageData();
      successToastMessage('sync finish');
    } else {
      setLoading(false);
      errorToastMessage(error, message);
    }
  }, [getStorageData]);

  const storageSync = useCallback(
    async (id) => {
      const response = await callApi({
        url: `storage/sync/${id}`,
        method: 'PUT',
      });

      const { status, error, message } = response;

      if (status === STATUS_SUCCESS) {
        getStorageData();
        successToastMessage('sync finish');
      } else {
        errorToastMessage(error, message);
      }
    },
    [getStorageData],
  );

  useEffect(() => {
    if (!mountRef.current) {
      getStorageData();
    }
    return () => (mountRef.current = true);
  }, [getStorageData]);

  return (
    <AdminStorageContent
      distributionType={distributionType}
      storageSettingOpen={storageSettingOpen}
      distributionHandler={distributionHandler}
      distributionTypeHandler={distributionTypeHandler}
      getStorageData={getStorageData}
      createHandler={createHandler}
      createType={createType}
      totalData={totalData}
      tableData={tableData}
      totalGraphData={totalGraphData}
      originTableData={originTableData}
      createTypeHandler={createTypeHandler}
      textInputHandler={textInputHandler}
      searchInputData={searchInputData}
      storageTotalSync={storageTotalSync}
      storageSync={storageSync}
      usageLoading={usageLoading}
      loading={loading}
    />
  );
}

export default AdminStoragePage;
