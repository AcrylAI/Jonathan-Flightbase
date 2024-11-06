import { Story } from '@storybook/react';
import BarChart from './BarChart';
import { BarChartArgs } from './types';
import { mockData } from './mockData';

export default {
  title: 'UI KIT/Molecules/Chart/BarChart',
  component: BarChart,
  parameters: {
    componentSubtitle: 'Bar Chart 컴포넌트',
  },
};

const BarChartTemplate = (args: BarChartArgs) => <BarChart {...args} />;

export const PrimaryBarChart: Story<BarChartArgs> = BarChartTemplate.bind({});
PrimaryBarChart.args = {
  data: mockData,
  width: 1000,
  height: 470,
  barWidth: 25,
  barColor: 'rgba(255, 0, 0, 0.3)',
  axisColor: '#efasd0',
  unitsPerTickX: 1,
  unitsPerTickY: 1,
  drawXAxis: true,
  drawXValue: true,
  drawXTick: true,
  drawYAxis: true,
  drawYValue: true,
  drawYTick: true,
  isAxisDraw: true,
};
