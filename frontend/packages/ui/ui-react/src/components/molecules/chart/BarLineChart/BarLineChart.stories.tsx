import { Story } from '@storybook/react';

import BarLineChart from './BarLineChart';

import { BarLineChartArgs } from './types';
import { mockData } from './mockData';

export default {
  title: 'UI KIT/Molecules/Chart/BarLineChart',
  component: BarLineChart,
  parameters: {
    componentSubtitle: 'Bar Line Chart 컴포넌트',
  },
};

const BarLineChartTemplate = (args: BarLineChartArgs) => (
  <BarLineChart {...args} />
);

export const PrimaryBarLineChart: Story<BarLineChartArgs> =
  BarLineChartTemplate.bind({});
PrimaryBarLineChart.args = {
  data: mockData,
  width: 1000,
  height: 470,
  point: 2,
  barWidth: 25,
  axisColor: '#efasd0',
  barChartColor: 'rgba(255, 0, 0, 0.3)',
  lineChartColor: 'rgba(0, 0, 255, 0.3)',
  unitsPerTickX: 1,
  unitsPerTickY: 1,
  activeTooltip: false,
  tooltipStyle: {},
  drawXAxis: true,
  drawXValue: true,
  drawXTick: true,
  drawYAxis: true,
  drawYValue: true,
  drawYTick: true,
  isAxisDraw: true,
};
