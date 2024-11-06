import { useDocument } from '@react';

import BarLineChart from '@graph/canvas/BarLineChart';

const mockData = {
  xAxisSelector: 'xAxisData',
  lineDataSelector: 'lineData',
  barDataSelector: 'barData',
  data: [
    {
      xAxisData: 0,
      lineData: 10,
      barData: 10,
    },
    {
      xAxisData: 1,
      lineData: 1,
      barData: 3,
    },
    {
      xAxisData: 2,
      lineData: 2,
      barData: 4,
    },
    {
      xAxisData: 3,
      lineData: 4,
      barData: 1,
    },
    {
      xAxisData: 4,
      lineData: 6,
      barData: 10,
    },
    {
      xAxisData: 5,
      lineData: 5,
      barData: 9,
    },
    {
      xAxisData: 6,
      lineData: 8,
      barData: 11,
    },
    {
      xAxisData: 7,
      lineData: 1,
      barData: 8,
    },
    {
      xAxisData: 8,
      lineData: 10,
      barData: 10,
    },
    {
      xAxisData: 9,
      lineData: 13,
      barData: 5,
    },
    {
      xAxisData: 10,
      lineData: 16,
      barData: 6,
    },
    {
      xAxisData: 11,
      lineData: 17,
      barData: 9,
    },
    {
      xAxisData: 12,
      lineData: 21,
      barData: 10,
    },
    {
      xAxisData: 13,
      lineData: 23,
      barData: 12,
    },
    {
      xAxisData: 14,
      lineData: 20,
      barData: 10,
    },
    {
      xAxisData: 15,
      lineData: 13,
      barData: 21,
    },
    {
      xAxisData: 16,
      lineData: 15,
      barData: 20,
    },
    {
      xAxisData: 17,
      lineData: 17,
      barData: 16,
    },
    {
      xAxisData: 18,
      lineData: 14,
      barData: 14,
    },
  ],
};

function CanvasBarLineChart() {
  useDocument(() => {
    const param = {
      canvas: document.getElementById('bar-line-chart') as HTMLCanvasElement,
      tooltip: document.getElementById('tooltip'),
      unitsPerTickX: 1,
      unitsPerTickY: 1,
      width: 1800,
      height: 470,
      axisColor: '#555',
      data: mockData,
      barWidth: 20,
      point: 3,
    };
    const drawParam = {
      drawXAxis: true,
      drawXValue: true,
      drawXTick: true,
      drawYAxis: true,
      drawYValue: true,
      drawYTick: true,
      activeTooltip: true,
      tooltipStyle: {
        width: '50px',
        height: 'auto',
        padding: '10px',
        border: '1px solid gray',
        borderRadius: '4px',
      },
    };
    const barLineChart = new BarLineChart(param);
    barLineChart.draw(drawParam);
  });

  return `
    <canvas id='bar-line-chart' />
    <div id='tooltip' />
  `;
}

export default CanvasBarLineChart;
