import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Template
import NodeDashboardTemplate from '../../nodeComponent/NodeDashboardTemplate';

// Components
import NodePieChart from '../../nodeComponent/NodePieChart';
import NodeRateList from '../../nodeComponent/NodeRateList';
import Stack from '../../nodeComponent/NodeRateList/Stack';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

let IS_MOUNT = false;
function RamUsageStatus() {
  // 다국어 지원
  const { t } = useTranslation();

  // Component State
  const [pieChartData, setPieChartData] = useState({
    total: 0,
    label: '',
    value: 0,
  });

  const [rateList, setRateList] = useState(null);

  const getRamUsage = async () => {
    if (!IS_MOUNT) return;
    const res = await callApi({
      url: 'nodes/resource_usage_status_overview?resource_type=ram',
      method: 'get',
    });

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const { used, total } = result.ram;
      setPieChartData({
        total,
        data: [{ label: t('allocated.label'), value: used }],
        label: t('allocated.label'),
        value: used,
      });
      setTimeout(() => {
        getRamUsage();
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
      url: 'nodes/ram_usage_status_by_node',
      method: 'get',
    });

    const { result, status, message } = res;
    if (status === STATUS_SUCCESS) {
      const objKeys = Object.keys(result);
      const listData = [];
      for (let i = 0; i < objKeys.length; i += 1) {
        const key = objKeys[i];
        const {
          limits,
          total,
          usage_rate: usageRate,
          alloc_rate: allocRate,
          pod_usage_rate: podUsageRate,
        } = result[key];
        listData.push({
          name: key,
          used: limits,
          total,
          usageRate,
          allocRate,
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
    getRamUsage();
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
          title={t('nodesUsingRam.label')}
          total={pieChartData.total}
          label={pieChartData.label}
          value={pieChartData.value}
        />
      }
      listRender={
        <NodeRateList
          title={t('ramUsageRateByNode.label')}
          listData={rateList}
          columns={[
            {
              label: t('node.label'),
              selector: 'name',
              headStyle: { flex: '1 0 120px' },
              bodyStyle: {
                flex: '1 0 120px',
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
              label: t('ram.label'),
              selector: 'name',
              headStyle: { flex: '0 0 100px' },
              bodyStyle: { flex: '0 0 100px', fontSize: '12px' },
              cell: ({ total }) => <>{`(${total}GB)`}</>,
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

export default RamUsageStatus;
