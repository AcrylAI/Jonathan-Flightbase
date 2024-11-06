import { Story } from '@storybook/react';

import PieChart from './PieChart';
import { PieChartArgs } from './types';

export default {
  title: 'UI KIT/Molecules/Chart/PieChart',
  component: PieChart,
  parameters: {
    componentSubtitle: 'Pie Chart 컴포넌트',
  },
  argTypes: {
    chartSize: {
      control: { disable: true },
    },
    data: {
      control: { disable: true },
    },
  },
};

const PieChartTemplate = (args: PieChartArgs) => <PieChart {...args} />;
export const PrimaryPieChart: Story<PieChartArgs> = PieChartTemplate.bind({});
PrimaryPieChart.args = {
  data: [
    {
      title: {
        text: 'One',
        color: 'white',
        style: 'normal bold 15px serif',
      },
      titlePosition: 0.75,
      value: 5,
      color: '#123534',
    },
    {
      title: {
        text: 'two',
        color: 'white',
        style: 'normal bold 15px serif',
      },
      value: 10,
      titlePosition: 0.75,
      color: '#945938',
    },
  ],
  chartBolder: {
    designatedBolder: undefined,
    custom: 0.5,
  },
  totalValue: 20,
  chartFillColor: 'rgb(230, 230, 230)',
  centerText: {
    text: ['Center', 'text'],
    color: 'black',
    style: 'normal bold 20px serif',
  },
};
