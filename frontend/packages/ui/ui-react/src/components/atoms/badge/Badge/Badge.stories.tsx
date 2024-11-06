import { Story } from '@storybook/react';

import Badge from './Badge';
import { BadgeArgs, BadgeInit } from './types';

export default {
  title: 'UI KIT/Atoms/Badge',
  component: Badge,
  parameters: {
    componentSubtitle: 'Badge 컴포넌트',
  },
  argTypes: {
    label: {
      control: {
        type: 'text',
      },
    },
    type: {
      control: {
        type: 'text',
      },
    },
  },
};

const BadgeTemplate = (args: BadgeArgs): JSX.Element => {
  return <Badge {...args} />;
};

export const PrimaryBadge: Story<BadgeArgs> = BadgeTemplate.bind({});
PrimaryBadge.args = {
  label: BadgeInit.label,
  type: BadgeInit.type,
};
