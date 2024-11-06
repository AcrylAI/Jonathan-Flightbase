import { useState, useEffect } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Template
import NodeDashboardTemplate from '../../nodeComponent/NodeDashboardTemplate';

// Components
import NodePieChart from '../../nodeComponent/NodePieChart';
import NodeStackBarChart from '../../nodeComponent/NodeStackBarChart';
import NodeRateList from '../../nodeComponent/NodeRateList';
import Stack from '../../nodeComponent/NodeRateList/Stack';
import { Selectbox } from '@jonathan/ui-react';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

let IS_MOUNT = false;

const getColumns = (target, t) => {
  if (target === 'model') {
    return [
      {
        label: t('gpuModel.label'),
        selector: 'gpuName',
        headStyle: { flex: '1 1 180px' },
        bodyStyle: {
          flex: '1 1 180px',
          fontSize: '12px',
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'SpoqaM',
          paddingRight: '40px',
        },
        cell: ({ gpuName, migMode }) => (
          <>
            {gpuName}
            {migMode && (
              <>
                <br />
                {migMode}
              </>
            )}
          </>
        ),
      },
      {
        label: t('gpu.label'),
        selector: 'name',
        headStyle: { flex: '0 0 80px' },
        bodyStyle: { flex: '0 0 80px', fontSize: '12px' },
        cell: ({ used, total }) => <>{`(${used}/${total})`}</>,
      },
      {
        label: t('allocationRate.label'),
        headStyle: { flex: '1 1 160px' },
        bodyStyle: { flex: '1 1 160px' },
        cell: ({ rate }) => <Stack rate={rate} />,
      },
    ];
  }
  return [
    {
      label: t('node.label'),
      selector: 'nodeName',
      headStyle: { flex: '1 1 180px' },
      bodyStyle: {
        flex: '1 1 180px',
        fontSize: '12px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: 'SpoqaM',
        paddingRight: '40px',
      },
    },
    {
      label: t('gpuModel.label'),
      selector: 'gpuName',
      headStyle: { flex: '1 1 180px' },
      bodyStyle: {
        flex: '1 1 180px',
        fontSize: '12px',
        boxSizing: 'border-box',
        // whiteSpace: 'nowrap',
        // overflow: 'hidden',
        // textOverflow: 'ellipsis',
        fontFamily: 'SpoqaM',
        paddingRight: '40px',
      },
      cell: ({ gpuName, migMode }) => (
        <>
          {gpuName}
          {migMode && (
            <>
              <br />
              {migMode}
            </>
          )}
        </>
      ),
    },
    {
      label: t('gpu.label'),
      selector: 'name',
      headStyle: { flex: '0 0 80px' },
      bodyStyle: { flex: '0 0 80px', fontSize: '12px' },
      cell: ({ used, total }) => <>{`(${used}/${total})`}</>,
    },
    {
      label: t('allocationRate.label'),
      headStyle: { flex: '1 1 140px' },
      bodyStyle: { flex: '1 1 140px' },
      cell: ({ rate }) => <Stack rate={rate} />,
    },
  ];
};

/**
 * GPU 할당 상태 컴포넌트
 * @component
 * @example
 *
 * return (
 *  <GPUAllocationStatus />
 * );
 */
function GPUAllocationStatus() {
  // 다국어 지원
  const { t } = useTranslation();

  // Component State
  // 파이 차트 데이터
  const [pieChartData, setPieChartData] = useState({
    total: 0,
    label: '',
    value: 0,
  });

  // 막대 그래프 데이터
  const [stackBarChartData, setStackBarChartData] = useState([
    { label: '-', value: 0, total: 0 },
    { label: '-', value: 0, total: 0 },
  ]);

  // 테이블 데이터
  const [rateByGpuModelList, setRateByGpuModelList] = useState(null);
  const [rateByNodeList, setRateByNodeList] = useState(null);
  const rateListOptions = [
    { label: t('allocationRateByGpuModel.label'), value: 'model' },
    { label: t('allocationRateByNode.label'), value: 'node' },
  ];
  const [rateListTarget, setRateListTarget] = useState({
    label: t('allocationRateByGpuModel.label'),
    value: 'model',
  });

  /**
   * GPU 할당 상태 파이 차트, 막대 그래프 데이터 조회
   */
  const getTotalGPUAllocation = async () => {
    const res = await callApi({
      url: 'nodes/gpu_usage_status_overview',
      method: 'get',
    });

    if (!IS_MOUNT) return;

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      // 파이 차트 데이터
      const { all, general, mig } = result;
      setPieChartData({
        total: all.total,
        data: [{ label: t('allocated.label'), value: all.used }],
        label: t('allocated.label'),
        value: all.used,
      });

      // 스택바 차트 데이터
      const newStackBarData = [];
      if (general)
        newStackBarData.push({
          label: t('gpuAllocationRate.label'),
          value: general.used,
          total: general.total,
        });
      if (mig)
        newStackBarData.push({
          label: t('migAllocationRate.label'),
          value: mig.used,
          total: mig.total,
        });

      setStackBarChartData(newStackBarData);

      setTimeout(() => {
        getTotalGPUAllocation();
      }, 1000);
    } else if (status === STATUS_FAIL) {
      toast.error(message);
    } else {
      toast.error('fail');
    }
  };

  /**
   * GPU 모델별 할당률 목록 조회
   * @returns {void}
   */
  const getGPUAllocationByModel = async () => {
    const res = await callApi({
      url: 'nodes/gpu_usage_status_by_model',
      method: 'get',
    });

    if (!IS_MOUNT) return;

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const objKeys = Object.keys(result);
      const newRateByGpuModelList = [];

      for (let i = 0; i < objKeys.length; i += 1) {
        const key = objKeys[i];
        const { used, total, usage_rate: rate } = result[key];

        const [gpuName, migMode] = key.split('\n');

        newRateByGpuModelList.push({
          gpuName,
          migMode,
          used,
          total,
          rate,
        });
      }

      setRateByGpuModelList(newRateByGpuModelList);
      setTimeout(() => {
        getGPUAllocationByModel();
      }, 1000);
    } else if (status === STATUS_FAIL) {
      setRateByGpuModelList([]);
      toast.error(message);
    } else {
      setRateByGpuModelList([]);
      toast.error(message);
    }
  };

  /**
   * GPU 노드별 할당률 목록 조회
   * @returns {void}
   */
  const getGPUAllocationByNode = async () => {
    const res = await callApi({
      url: 'nodes/gpu_usage_status_by_node',
      method: 'get',
    });

    if (!IS_MOUNT) return;

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const objKeys = Object.keys(result);
      const newRateByNodeList = [];

      for (let i = 0; i < objKeys.length; i += 1) {
        const key = objKeys[i];
        const [nodeName, gpuName, migMode] = key.split('\n');
        const { used, total, usage_rate: rate } = result[key];
        newRateByNodeList.push({
          nodeName,
          gpuName,
          migMode,
          used,
          total,
          rate,
        });
      }

      setRateByNodeList(newRateByNodeList);
      setTimeout(() => {
        getGPUAllocationByNode();
      }, 1000);
    } else if (status === STATUS_FAIL) {
      setRateByNodeList([]);
      toast.error(message);
    } else {
      setRateByNodeList([]);
      toast.error(message);
    }
  };

  // Events
  /**
   * 노드별 모델별 셀렉트 이벤트 핸들러
   * @param {{ label: 'allocationRateByGpuModel.label', value: 'model' } | { label: 'allocationRateByNode.label', value: 'node' }} select
   */
  const selectInputHandler = (select) => {
    setRateListTarget(select);
  };

  // LifeCycle
  useEffect(() => {
    IS_MOUNT = true;
    getTotalGPUAllocation();
    getGPUAllocationByModel();
    getGPUAllocationByNode();

    return () => {
      IS_MOUNT = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NodeDashboardTemplate
      pieChartRender={
        <NodePieChart
          title={t('totalGpuAllocationStatus.label')}
          total={pieChartData.total}
          label={pieChartData.label}
          value={pieChartData.value}
        />
      }
      stackBarChartRender={<NodeStackBarChart data={stackBarChartData} />}
      listRender={
        <NodeRateList
          title={
            <Selectbox
              size='small'
              list={rateListOptions}
              selectedItem={rateListTarget}
              onChange={selectInputHandler}
            />
          }
          listData={
            rateListTarget.value === 'model'
              ? rateByGpuModelList
              : rateByNodeList
          }
          columns={getColumns(rateListTarget.value, t)}
          // columns={['GPU Model', 'GPU', 'GPU Model']}
        />
      }
    />
  );
}

export default GPUAllocationStatus;
