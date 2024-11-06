import { Story } from '@storybook/react';

import Emptybox from './Emptybox';

import { EmptyboxArgs } from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Emptybox',
  component: Emptybox,
  parameters: {
    componentSubtitle: 'Emptybox 컴포넌트',
  },
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const EmptyboxTemplate = (args: EmptyboxArgs) => <Emptybox {...args} />;

export const PrimaryEmptybox: Story<EmptyboxArgs> = EmptyboxTemplate.bind({});
PrimaryEmptybox.args = {
  isBox: false,
  customStyle: {},
  text: 'No data',
  theme: theme.PRIMARY_THEME,
};
