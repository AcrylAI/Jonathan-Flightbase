import { Story } from '@storybook/react';

import Loading from './Loading';

import { LoadingArgs } from './types';

export default {
  title: 'UI KIT/Atoms/Loading',
  component: Loading,
  parameters: {
    componentSubtitle: 'Loading 컴포넌트',
  },
  argTypes: {},
};

const LoadingTemplate = (args: LoadingArgs) => <Loading {...args} />;

export const PrimaryLoading: Story<LoadingArgs> = LoadingTemplate.bind({});
PrimaryLoading.args = {
  type: 'primary',
  customStyle: {},
};

export const CircleLoading: Story<LoadingArgs> = LoadingTemplate.bind({});
CircleLoading.args = {
  type: 'circle',
  customStyle: {},
};
