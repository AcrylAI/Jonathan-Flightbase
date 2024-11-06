import { useDocument } from '@react';

import BarChart from '@graph/canvas/BarChart';

const mockData = {
  xAxisSelector: 'xAxisData',
  dataSelector: 'barData',
  data: [
    {
      xAxisData: 0,
      barData: [
        {
          value: 1,
          color: 'red',
        },
        {
          value: 3,
          color: 'yellow',
        },
        {
          value: 3,
          color: 'blue',
        },
      ],
    },
    {
      xAxisData: 1,
      barData: [
        {
          value: 7,
          color: 'gray',
        },
        {
          value: 3,
          color: 'yellow',
        },
      ],
      maxValue: 10,
      minValue: 3,
    },
    {
      xAxisData: 2,
      barData: [
        {
          value: 2,
          color: 'gray',
        },
        {
          value: 4,
          color: 'black',
        },
        {
          value: 1,
          color: 'yellow',
        },
      ],
    },
    {
      xAxisData: 3,
      barData: [
        {
          value: 3,
          color: 'gray',
        },
        {
          value: 3,
          color: 'yellow',
        },
      ],
    },
    {
      xAxisData: 4,
      barData: 10,
    },
    {
      xAxisData: 5,
      barData: [
        {
          value: 4,
          color: 'gray',
        },
        {
          value: 3,
          color: 'red',
        },
        {
          value: 3,
          color: 'blue',
        },
        {
          value: 3,
          color: 'green',
        },
      ],
    },
  ],
};

function CanvasBarChart() {
  useDocument(() => {
    const param = {
      canvas: document.getElementById('bar-chart') as HTMLCanvasElement,
      data: mockData,
      width: 1800,
      height: 470,
      unitsPerTickX: 1,
      unitsPerTickY: 1,
      barWidth: 20,
      isAxisDraw: true,
    };
    const drawParam = {
      drawXAxis: true,
      drawXValue: true,
      drawXTick: true,
      drawYAxis: true,
      drawYValue: true,
      drawYTick: true,
    };
    const barChart = new BarChart(param);
    barChart.draw(drawParam);
  });

  return `<canvas id='bar-chart'/>`;
}

export default CanvasBarChart;
