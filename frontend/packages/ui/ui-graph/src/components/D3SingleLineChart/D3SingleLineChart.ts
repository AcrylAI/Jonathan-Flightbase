import { useDocument } from '@react';

import LineChart from '@graph/d3/LineChart';

function D3SingleLineChart(): string {
  useDocument(() => {
    const param = {
      eleId: 'd3-single-line',
      width: 1200,
      height: 300,
      isResponsive: true,
      legend: true,
      xAxisMaxTicks: 6,
      tooltip: {
        align: 'right',
      },
    };

    const data = [
      { x: 1, y1: 20, y2: 10 },
      { x: 2, y1: 11, y2: 10 },
      { x: 3, y1: 2, y2: 1 },
      { x: 4, y1: 80, y2: 10 },
      { x: 5, y1: 90, y2: 10 },
      { x: 6, y1: 100, y2: 10 },
    ];

    const series = [
      {
        align: 'LEFT',
        x: 'x',
        y: 'y1',
        color: '#e57373',
        label: 'y1',
        domain: [0, 100],
      },
    ];

    const lineChart = new LineChart(param);
    lineChart.init(data);
    lineChart.setSeries(series);
    lineChart.draw();
  });

  return `<div id="d3-single-line">r123123</div>`;
}

export default D3SingleLineChart;
