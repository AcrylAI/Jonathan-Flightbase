import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Template
import NodeDashboardTemplate from '../../nodeComponent/NodeDashboardTemplate';

// Conponents
import NodePieChart from '../../nodeComponent/NodePieChart';
import NodeRateList from '../../nodeComponent/NodeRateList';
import Stack from '../../nodeComponent/NodeRateList/Stack';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

let IS_MOUNT = false;

function CPUAllocationStatus() {
  // 다국어 지원 hook
  const { t } = useTranslation();

  // Component State
  const [pieChartData, setPieChartData] = useState({
    total: 0,
    label: '',
    value: 0,
  });

  const [rateList, setRateList] = useState(null);

  const getCPUCoreAllocation = async () => {
    if (!IS_MOUNT) return;

    const res = await callApi({
      url: 'nodes/resource_usage_status_overview?resource_type=cpu',
      method: 'get',
    });

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const { used, total } = result.cpu;
      setPieChartData({
        total,
        data: [{ label: t('allocated.label'), value: used }],
        label: t('allocated.label'),
        value: used,
      });
      setTimeout(() => {
        getCPUCoreAllocation();
      }, 1000);
    } else if (status === STATUS_FAIL) {
      toast.error(message);
    } else {
      toast.error('fail');
    }
  };

  const getCPUAllocationByModel = async () => {
    if (!IS_MOUNT) return;

    const res = await callApi({
      url: 'nodes/cpu_usage_status_by_model',
      method: 'get',
    });

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const objKeys = Object.keys(result);
      const listData = [];

      for (let i = 0; i < objKeys.length; i += 1) {
        const key = objKeys[i];
        const {
          cpu_model,
          used,
          total,
          usage_rate: usageRate,
          alloc_rate: allocRate,
          pod_usage_rate: podUsageRate,
        } = result[key];
        listData.push({
          cpuModel: cpu_model,
          name: key,
          used,
          total,
          allocRate,
          usageRate,
          podUsageRate,
        });
      }

      setRateList(listData);
      setTimeout(() => {
        getCPUAllocationByModel();
      }, 1000);
    } else if (status === STATUS_FAIL) {
      setRateList([]);
      toast.error(message);
    } else {
      setRateList([]);
      toast.error(message);
    }
  };

  useEffect(() => {
    IS_MOUNT = true;
    getCPUCoreAllocation();
    getCPUAllocationByModel();

    return () => {
      IS_MOUNT = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NodeDashboardTemplate
      pieChartRender={
        <NodePieChart
          title={t('cpuCoreAllocationStatus.label')}
          total={pieChartData.total}
          label={pieChartData.label}
          value={pieChartData.value}
        />
      }
      listRender={
        <NodeRateList
          title={t('coreAllocationRateByCpuModel.label')}
          listData={rateList}
          columns={[
            {
              label: t('cpuModel.label'),
              selector: 'name',
              headStyle: { flex: '1 0 120px' },
              bodyStyle: {
                flex: '1 0 120px',
                fontSize: '12px',
                boxSizing: 'border-box',
                fontFamily: 'SpoqaM',
                paddingRight: '40px',
              },
              cell: ({ name, cpuModel }) => {
                return (
                  <>
                    {cpuModel && (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            marginBottom: '4px',
                            paddingBottom: '4px',
                            borderBottom: '1px solid #c1c1c1',
                          }}
                        >
                          {cpuModel}
                        </span>
                        <br />
                      </>
                    )}
                    <span>{name}</span>
                  </>
                );
              },
            },
            {
              label: t('core.label'),
              selector: 'name',
              headStyle: { flex: '0 0 80px' },
              bodyStyle: { flex: '0 0 80px', fontSize: '12px' },
              cell: ({ used, total }) => <>{`(${used}/${total})`}</>,
            },
            {
              label: t('assigned.label'),
              selector: 'name',
              headStyle: { flex: '1 1 126px' },
              bodyStyle: { flex: '1 1 126px' },
              cell: ({ allocRate }) => <Stack rate={allocRate} />,
            },
            {
              label: t('usageRate.label'),
              headStyle: { flex: '1 1 126px' },
              bodyStyle: { flex: '1 1 126px' },
              cell: ({ usageRate }) => <Stack rate={usageRate} />,
            },
            {
              label: t('podUsageRate.label'),
              headStyle: { flex: '1 1 126px' },
              bodyStyle: { flex: '1 1 126px' },
              cell: ({ podUsageRate }) => <Stack rate={podUsageRate} />,
            },
          ]}
        />
      }
    />
  );
}

export default CPUAllocationStatus;
