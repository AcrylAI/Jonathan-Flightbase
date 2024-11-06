import { useDocument } from '@react';

import LineChart from '@src/graph/canvas/CanvasChart/AxisTypeChart/LineChart';

const mockSeries = {
  left: [
    {
      color: 'red',
      name: 'left1',
      lineWidth: 2,
      series: [9, 8, 7, 10, 6, 8, 5, 8, 7, 9],
    },
    {
      color: 'blue',
      name: 'left2',
      lineWidth: 2,
      series: [1, 4, 3, 2, 5, 7, 6, 4, 5, 2],
    },
  ],
  right: [
    {
      series: [30, 23, 38, 31, 21, 22, 25, 22, 33, 42],
      name: 'right1',
      lineWidth: 2,
      color: '#8D3F47',
    },
    {
      name: 'right2',
      series: [18, 22, 25, 43, 53, 54, 49, 42, 32, 22],
      lineWidth: 2,
      color: '#FD3FA7',
    },
  ],
};

const mockingAxisInfo = {
  bottom: {
    unitsPerTick: 1,
    name: 'X axis',
    tickSize: 7,
    lineWidth: 1,
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  left: {
    name: 'left axis',
    unitsPerTick: 1,
    tickSize: 7,
    lineWidth: 1,
  },
  right: {
    name: 'right axis',
    unitsPerTick: 10,
    tickSize: 7,
    lineWidth: 1,
  },
};

function CanvasLineChart() {
  useDocument(() => {
    const param = {
      nodeId: 'layer',
      point: 2,
      font: 'normal bold 12px SpoqaM',
      fontHeight: 12,
    };
    const dataParam = {
      series: mockSeries,
      axis: mockingAxisInfo,
    };
    const lineChart = new LineChart(param);
    lineChart.dataInitialize(dataParam);
    lineChart.render();
  });

  return `
    <div style='height:710px'>
      <div id='layer'></div>
    </div>
  `;
}

export default CanvasLineChart;
