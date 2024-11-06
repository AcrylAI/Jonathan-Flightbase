import { useDocument } from '@react';

import PieChart from '@graph/canvas/PieChart';

function CanvasPieChart() {
  useDocument(() => {
    const param = {
      canvas: document.getElementById('pie-chart') as HTMLCanvasElement,
      data: [
        {
          title: {
            text: 'One',
            color: 'white',
            style: 'normal bold 15px serif',
          },
          value: 2,
          color: '#123534',
          titlePosition: 0.8,
        },
        {
          title: {
            text: 'two',
            color: 'white',
            style: 'normal bold 15px serif',
          },
          value: 1,
          color: '#945938',
          titlePosition: 0.8,
        },
      ],
      chartBolder: {
        custom: 0.5,
      },
      totalValue: 7,
      chartFillColor: 'rgb(230, 230, 230)',
      centerText: {
        text: ['Center', 'Text'],
        color: 'black',
        style: 'normal bold 17px serif',
      },
    };
    const pieChart = new PieChart(param);
    pieChart.draw();
  });

  return `<canvas id='pie-chart'/>`;
}

export default CanvasPieChart;
