// Components
import ECharts from 'echarts-for-react';

function ParallelFlowChart({ parallelAxis }) {
  return (
    <ECharts
      option={parallelAxis}
      style={{
        height: '400px',
      }}
    />
  );
}

export default ParallelFlowChart;
