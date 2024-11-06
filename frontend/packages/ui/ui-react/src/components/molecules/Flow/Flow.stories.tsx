import { Story } from '@storybook/react';
import Flow from './Flow';
import { mockData } from './mockData';

export default {
  title: 'UI KIT/Molecules/Flow',
  component: Flow,
  parameters: {
    componentSubtitle: 'Bar Line Chart 컴포넌트',
  },
};

const FlowTemplate = (args: any) => {
  return <Flow {...args} />;
};

export const PrimaryFlow: Story<any> = FlowTemplate.bind({});
PrimaryFlow.args = {
  data: mockData,
  width: '1000px',
  height: '500px',
  metricLabel: 'Metric',
  seedModelLabel: 'Seed Model',
  resultModelLabel: 'Result Model',
};
