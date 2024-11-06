import { Story } from '@storybook/react';

import LineChart from './LineChart';
import { chartTypes, data, LineChartArgs } from './types';

export default {
  title: 'UI KIT/Molecules/Chart/LineChart',
  component: LineChart,
  parameters: {
    componentSubtitle: 'Line Chart 컴포넌트',
  },
  argTypes: {
    width: {
      control: { type: 'number' },
    },
    type: {
      control: { disable: true },
    },
    height: {
      control: { type: 'number' },
    },
    id: {
      control: {
        disable: true,
      },
    },
    isResponsive: {
      control: {
        type: 'boolean',
      },
    },
  },
};
const LineChartTemplate = (args: LineChartArgs) => <LineChart {...args} />;
export const SingleLineChart: Story<LineChartArgs> = LineChartTemplate.bind({});
SingleLineChart.args = {
  id: 'single-line-chart',
  type: chartTypes.SINGLE,
  width: 800,
  height: 300,
  isResponsive: true,
  legend: true,
  series: [
    {
      align: 'LEFT',
      x: 'x',
      y: 'y1',
      color: '#e57373',
      label: 'y1',
      domain: [0, 100],
    },
  ],
  data,
};

export const MultiLineChart: Story<LineChartArgs> = LineChartTemplate.bind({});
MultiLineChart.args = {
  id: 'multi-line-chart',
  type: chartTypes.MULTI,
  width: 800,
  height: 300,
  isResponsive: true,
  legend: true,
  series: [
    {
      align: 'LEFT',
      x: 'x',
      y: 'y1',
      color: '#e57373',
      label: 'y1',
      domain: [0, 100],
    },
    {
      align: 'RIGHT',
      x: 'x',
      y: 'y2',
      color: '#7986cb',
      label: 'y2',
      domain: [0, 100],
    },
  ],
  data,
};

// export const FilledLineChart: Story<LineChartArgs> = LineChartTemplate.bind({});
// FilledLineChart.args = {
//   type: chartTypes.FILLED,
//   data,
// };
