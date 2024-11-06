import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';
import { openLoading, closeLoading } from '@src/store/modules/loading';

// Components
import AdminNodeDetail from '../AdminNodeDetail';
import Status from '@src/components/atoms/Status';
import Table from '@src/components/molecules/Table';
import useSortColumn from '@src/components/molecules/Table/TableHead/useSortColumn';
import SortColumn from '@src/components/molecules/Table/TableHead/SortColumn';
import { toast } from '@src/components/Toast';
import { Tooltip, Switch, Selectbox, Badge, Button } from '@jonathan/ui-react';

// Utils
import { errorToastMessage, defaultSuccessToastMessage } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import style from './NodeTable.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

let IS_MOUNT = false;

function NodeTable({ serverType }) {
  const { t } = useTranslation();

  // Component State
  const [nodeList, setNodeList] = useState([]);
  const [filteredNodeList, setFilteredNodeList] = useState([]);
  const [selectedNodeList, setSelectedNodeList] = useState([]);
  const [toggledClearRows, setToggledClearRows] = useState(false);
  const [searchKey, setSearchKey] = useState({
    label: t('nodeName.label'),
    value: 'node_name',
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [nodeStatus, setNodeStatus] = useState({
    label: t('allStatus.label'),
    value: 'all',
  });
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const { sortClickFlag, onClickHandler, clickedIdx, clickedIdxHandler } =
    useSortColumn(2);

  // Redux Hooks
  const dispatch = useDispatch();

  const searchOptions = [
    { label: t('nodeName.label'), value: 'node_name' },
    { label: t('ipAddress.label'), value: 'ip' },
  ];

  const statusOptions = [
    { label: t('allStatus.label'), value: 'all' },
    { label: t('attached'), value: 'attached' },
    { label: t('attaching'), value: 'attaching' },
    { label: t('detached'), value: 'detached' },
    { label: t('error'), value: 'error' },
    { label: t('unknown'), value: 'unknown' },
  ];

  /**
   * 검색
   *
   * @param {string} value 검색할 내용
   */
  const onSearch = useCallback(
    (value) => {
      let newNodeList = nodeList;

      if (nodeStatus.value !== 'all') {
        newNodeList = newNodeList.filter(
          (item) => item.condition.status === nodeStatus.value,
        );
      }

      if (value !== '') {
        newNodeList = newNodeList.filter((item) =>
          item[searchKey.value].includes(value),
        );
      }

      if (!IS_MOUNT) return;

      setSearchKeyword(value);
      setFilteredNodeList(newNodeList);
      setTotalRows(newNodeList.length);
    },
    [nodeList, nodeStatus, searchKey],
  );

  /**
   * API 호출 GET
   * 어드민 노드 데이터 가져오기
   */
  const getNodesData = useCallback(async () => {
    setLoading(true);
    let url = `nodes?server_type=${serverType}`;
    if (serverType === 'storage') url = 'storage_node/nodes';
    const response = await callApi({
      url,
      method: 'GET',
    });
    if (!IS_MOUNT) return;

    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setNodeList(result.list);
      setFilteredNodeList(result.list);
      setTotalRows(result.total);
      if (searchKeyword !== '') onSearch(searchKeyword);
    } else {
      errorToastMessage(error, message);
    }
    setLoading(false);
  }, [onSearch, searchKeyword, serverType]);

  // Events
  /**
   * 검색 내용 제거
   */
  const onClear = () => {
    onSearch('');
  };

  // Server Node 생성 이벤트
  const onCreate = useCallback(() => {
    dispatch(
      openModal({
        modalType: serverType === 'storage' ? 'ADD_STORAGE_NODE' : 'ADD_NODE',
        modalData: {
          submit: {
            text: t('add.label'),
            func: () => {
              getNodesData();
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
        },
      }),
    );
  }, [dispatch, getNodesData, serverType, t]);

  /**
   * 노드 수정
   *
   * @param {object} row 노드 데이터
   */
  const onUpdate = useCallback(
    (row) => {
      dispatch(
        openModal({
          modalType:
            serverType === 'storage' ? 'EDIT_STORAGE_NODE' : 'EDIT_NODE',
          modalData: {
            submit: {
              text: t('edit.label'),
              func: () => {
                getNodesData();
              },
            },
            cancel: {
              text: t('cancel.label'),
            },
            data: row,
            nodeId: row.id,
          },
        }),
      );
    },
    [dispatch, getNodesData, serverType, t],
  );

  /**
   * API 호출 Delete
   * 노드 삭제
   * 체크박스 선택된 노드 삭제
   * 현재 마스터 노드는 체크박스 선택이 안되게 처리해놓음
   */
  const onDelete = useCallback(async () => {
    const names = selectedNodeList.map(({ ip }) => ip);
    let flag = false;
    for (let i = 0; i < selectedNodeList.length; i += 1) {
      const {
        condition: { is_master: isMaster },
      } = selectedNodeList[i];
      if (isMaster) {
        flag = true;
        break;
      }
    }

    const response = await callApi({
      url: `nodes/${names.join(',')}`,
      method: 'delete',
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      setToggledClearRows(!toggledClearRows);
      getNodesData();
      if (flag) toast.warn(message);
      else defaultSuccessToastMessage('delete');
    } else {
      errorToastMessage(error, message);
    }
  }, [getNodesData, selectedNodeList, toggledClearRows]);

  /**
   * 노드 삭제 확인 모달
   */
  const openDeleteConfirmPopup = useCallback(() => {
    dispatch(
      openConfirm({
        title: 'deleteNodePopup.title.label',
        content: 'deleteNodePopup.message',
        submit: {
          text: t('delete.label'),
          func: () => {
            onDelete();
          },
        },
        cancel: {
          text: t('cancel.label'),
        },
      }),
    );
  }, [dispatch, onDelete, t]);

  /**
   * 노드 연결 핸들러 (연결/해제)
   *
   * @param {number} id 노드 ID
   * @param {string} nodeStatusValue 노드 상태 (attached | attaching | detached)
   * @param {string} reason 노드 상태 이유
   */
  const nodeConnectHandler = useCallback(
    async (id, nodeStatusValue, reason) => {
      let url = 'nodes/';
      if (nodeStatusValue !== 'detached' && reason.indexOf('detached') === -1) {
        url += `detach/${id}`;
      } else {
        url += `attach/${id}`;
      }
      dispatch(
        openLoading({
          target: 'bgLoading',
          text: `${
            nodeStatusValue !== 'attached' && nodeStatusValue !== 'attaching'
              ? 'Connecting'
              : 'Disconnecting'
          } to the node...`,
        }),
      );
      const response = await callApi({
        url,
        method: 'put',
      });
      const { status, message, error } = response;
      if (status === STATUS_SUCCESS) {
        defaultSuccessToastMessage(
          nodeStatusValue === 'detached' ? 'attach' : 'detach',
        );
        getNodesData();
        dispatch(closeLoading({ target: 'bgLoading' }));
      } else {
        errorToastMessage(error, message);
        dispatch(closeLoading({ target: 'bgLoading' }));
      }
    },
    [dispatch, getNodesData],
  );

  /**
   * 검색/필터 셀렉트 박스 이벤트 핸들러
   *
   * @param {string} name 검색/필터할 항목
   * @param {string} value 검색/필터할 내용
   */
  const selectInputHandler = useCallback((name, value) => {
    if (name === 'searchKey') {
      setSearchKey(value);
    } else if (name === 'nodeStatus') {
      setNodeStatus(value);
    }
  }, []);

  /**
   * 체크박스 선택
   *
   * @param {object} param0 선택된 행
   */
  const onSelect = ({ selectedRows }) => {
    setSelectedNodeList(selectedRows);
  };

  const commonColumns = [
    {
      name: t('status.label'),
      selector: 'condition',
      cell: ({ condition }) => (
        // attached, attaching, detached, error, unknown
        <Status
          status={condition.status}
          title={`${condition.reason}\n${condition.message}`}
        />
      ),
      sortable: false,
      maxWidth: '108px',
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('nodeName.label')}
          idx={0}
        />
      ),
      selector: 'node_name',
      minWidth: '160px',
      maxWidth: '240px',
      sortable: true,
      cell: ({
        condition: { is_master: isMaster },
        node_name: name,
        active_status: activeStatus,
      }) => {
        return (
          <>
            <div className={cx(isMaster && 'master')} title={name}>
              {name}
            </div>
            <div>
              {activeStatus === 1 && (
                <Badge
                  label={serverType.toUpperCase()}
                  type={serverType === 'gpu' ? 'green' : 'yellow'}
                  customStyle={{ marginLeft: '10px' }}
                />
              )}
            </div>
          </>
        );
      },
    },
    {
      name: (
        <SortColumn
          onClickHandler={clickedIdxHandler}
          sortClickFlag={sortClickFlag}
          title={t('ipAddress.label')}
          idx={1}
        />
      ),
      selector: 'ip',
      sortable: true,
      minWidth: '110px',
      maxWidth: '140px',
    },
  ];

  const actionColumns = [
    {
      name: t('connection.label'),
      minWidth: '100px',
      maxWidth: '120px',
      cell: (row) => {
        const {
          id,
          condition: { status, is_master: isMaster, reason },
        } = row;

        return (
          <Switch
            onChange={() => {
              nodeConnectHandler(id, status, reason);
            }}
            checked={
              // status 가 detached가 아니고 reason에도 없다면 on
              status !== 'detached' && reason.indexOf('detached') === -1
            }
            disabled={isMaster}
            customStyle={{ overflow: 'visible' }}
          />
        );
      },
      button: true,
    },
    {
      name: t('edit.label'),
      minWidth: '64px',
      maxWidth: '64px',
      cell: (row) => (
        <img
          className='table-icon'
          src='/images/icon/00-ic-basic-pen.svg'
          alt='edit'
          onClick={() => {
            onUpdate(row);
          }}
        />
      ),
      button: true,
    },
  ];

  const gpuColumns = [
    ...commonColumns,
    {
      name: t('gpuConfig.label'),
      minWidth: '240px',
      cell: ({ gpu_configuration: gpuConfiguration }) => (
        <div
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          {gpuConfiguration.map((config, idx) => (
            <span
              style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}
              key={idx}
            >
              {config}
              <br />
            </span>
          ))}
        </div>
      ),
    },
    {
      name: t('gpuInUse.label'),
      sortable: false,
      maxWidth: '140px',
      cell: ({ gpu_usage: gpuUsage }) => {
        return `${gpuUsage.general_used}/${gpuUsage.general_total} GPUs`;
      },
    },
    {
      name: t('migInUse.label'),
      sortable: false,
      maxWidth: '180px',
      cell: ({ gpu_usage: gpuUsage }) => {
        const { mig_detail: migDetail } = gpuUsage;
        const migDetailKeys = Object.keys(migDetail);

        return (
          <Tooltip
            contents={migDetailKeys.map((migName) => (
              <div key={migName}>
                <span
                  style={{
                    fontFamily: 'SpoqaB',
                    display: 'inline-block',
                    width: '100px',
                  }}
                >
                  {migName}
                </span>
                total : {migDetail[migName].total}, total :{' '}
                {migDetail[migName].used}
              </div>
            ))}
            contentsAlign={{ vertical: 'top', horizontal: 'center' }}
          >
            {`${gpuUsage.mig_used}/${gpuUsage.mig_total} MIGs`}
          </Tooltip>
        );
      },
    },
    ...actionColumns,
  ];

  const cpuColumns = [
    ...commonColumns,
    {
      name: t('cpuConfig.label'),
      minWidth: '200px',
      cell: ({ system_info: systemInfo }) => {
        return systemInfo.cpu;
      },
    },
    {
      name: t('cpuCoreInUse.label'),
      sortable: false,
      maxWidth: '180px',
      cell: ({ resource_usage: resourceUsage }) => {
        return `${resourceUsage.pod_alloc_cpu_cores}/${resourceUsage.cpu_cores}`;
      },
    },
    {
      name: t('memoryInUse.label'),
      sortable: false,
      maxWidth: '180px',
      cell: ({ resource_usage: resourceUsage }) => {
        return `${resourceUsage.pod_alloc_ram}/${resourceUsage.ram} GB`;
      },
    },
    ...actionColumns,
  ];

  const storageColumns = [
    ...commonColumns,
    {
      name: t('cpuConfig.label'),
      cell: ({ system_info: systemInfo }) => {
        return systemInfo.cpu;
      },
    },
  ];

  const filterList = (
    <>
      <div style={{ width: '180px' }}>
        <Selectbox
          list={statusOptions}
          selectedItem={nodeStatus}
          onChange={(value) => selectInputHandler('nodeStatus', value)}
          customStyle={{
            fontStyle: {
              selectbox: {
                fontSize: '14px',
              },
            },
          }}
        />
      </div>
    </>
  );

  const expandedComponent = (row) => {
    return <AdminNodeDetail data={row.data} />;
  };

  const topButtonList = (
    <>
      <Button type='primary' onClick={onCreate}>
        {serverType === 'storage'
          ? t('addStorageNode.label')
          : t('addNode.label')}
      </Button>
    </>
  );

  const bottomButtonList =
    serverType !== 'storage' ? (
      <>
        <Button
          type='red'
          onClick={openDeleteConfirmPopup}
          disabled={selectedNodeList.length === 0}
        >
          {t('delete.label')}
        </Button>
      </>
    ) : null;

  const conditionalRowStyles = [
    {
      when: (row) => row.active_status === 0,
      style: {
        backgroundColor: '#f0f0f0',
      },
    },
  ];

  const onSortHandler = (selectedColumn, sortDirection, sortedRows) => {
    onClickHandler(clickedIdx, sortDirection);
  };

  useEffect(() => {
    IS_MOUNT = true;

    getNodesData();
    return () => {
      IS_MOUNT = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    IS_MOUNT = true;
    onSearch(searchKeyword);
    return () => {
      IS_MOUNT = false;
    };
  }, [onSearch, searchKey, searchKeyword, nodeStatus]);

  return (
    <div>
      <Table
        loading={loading}
        topButtonList={topButtonList}
        bottomButtonList={filteredNodeList.length > 0 && bottomButtonList}
        columns={
          serverType === 'gpu'
            ? gpuColumns
            : serverType === 'cpu'
            ? cpuColumns
            : storageColumns
        }
        data={filteredNodeList}
        totalRows={totalRows}
        ExpandedComponent={expandedComponent}
        onSelect={onSelect}
        defaultSortField='node_name'
        toggledClearRows={toggledClearRows}
        selectableRowDisabled={({ condition }) => {
          if (condition) {
            const { is_master: isMaster } = condition;
            return isMaster;
          }
          return false;
        }}
        filterList={filterList}
        searchOptions={searchOptions}
        searchKey={searchKey}
        keyword={searchKeyword}
        onSearchKeyChange={(value) => {
          selectInputHandler('searchKey', value);
        }}
        onSearch={(e) => {
          onSearch(e.target.value);
        }}
        conditionalRowStyles={conditionalRowStyles}
        onClear={onClear}
        onSortHandler={onSortHandler}
      />
    </div>
  );
}

export default NodeTable;
