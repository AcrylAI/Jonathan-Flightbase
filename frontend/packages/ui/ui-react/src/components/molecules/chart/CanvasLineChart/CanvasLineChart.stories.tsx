import { Story } from '@storybook/react';

// Components
import CanvasLineChart from './CanvasLineChart';

// Types
import { CanvasLineChartArgs } from './types';
import {
  singleLineChartMockData,
  multiLineChartMockData,
  multiAxisChart,
} from './mockData';

export default {
  title: 'UI KIT/Molecules/Chart/CanvasLineChart',
  component: CanvasLineChart,
  parameters: {
    componentSubtitle: 'Canvas Line Chart 컴포넌트',
  },
};

const CanvasLineChartTemplate = (args: CanvasLineChartArgs) => {
  return <CanvasLineChart {...args} />;
};

export const SingleLineChart: Story<CanvasLineChartArgs> =
  CanvasLineChartTemplate.bind({});
SingleLineChart.args = {
  id: 'single-line-chart',
  series: singleLineChartMockData.series,
  axis: singleLineChartMockData.axis,
  renderOption: {
    bottomAxis: true,
    bottomTick: true,
    bottomText: true,
    leftAxis: true,
    leftTick: true,
    leftText: true,
    rightAxis: false,
    rightTick: false,
    rightText: false,
    tooltip: true,
    legend: true,
    guideLine: true,
  },
};

export const MultiLineChart: Story<CanvasLineChartArgs> =
  CanvasLineChartTemplate.bind({});
MultiLineChart.args = {
  id: 'multi-line-chart',
  series: multiLineChartMockData.series,
  axis: multiLineChartMockData.axis,
  renderOption: {
    bottomAxis: true,
    bottomTick: true,
    bottomText: true,
    leftAxis: true,
    leftTick: true,
    leftText: true,
    rightAxis: false,
    rightTick: false,
    rightText: false,
    tooltip: true,
    legend: true,
    guideLine: true,
  },
};

export const MultiAxisChart: Story<CanvasLineChartArgs> =
  CanvasLineChartTemplate.bind({});
MultiAxisChart.args = {
  id: 'multi-axis-line-chart',
  series: multiAxisChart.series,
  axis: multiAxisChart.axis,
  renderOption: {
    bottomAxis: true,
    bottomTick: true,
    bottomText: true,
    leftAxis: true,
    leftTick: true,
    leftText: true,
    rightAxis: true,
    rightTick: true,
    rightText: true,
    tooltip: true,
    legend: true,
    guideLine: true,
  },
};
