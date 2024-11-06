import { Story } from '@storybook/react';

import StatusCard from './StatusCard';
import { StatusCardArgs } from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/StatusCard',
  component: StatusCard,
  parameters: {
    componentSubtitle: 'StatusCard 컴포넌트',
  },
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const StatusTemplate = (args: StatusCardArgs) => <StatusCard {...args} />;

export const RunningStatusCard: Story<StatusCardArgs> = StatusTemplate.bind({});
RunningStatusCard.args = {
  text: 'running',
  status: 'connected',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
  isTooltip: true,
  tooltipData: {
    title: 'title',
    description: 'description',
  },
};

export const PendingStatusCard: Story<StatusCardArgs> = StatusTemplate.bind({});
PendingStatusCard.args = {
  text: 'pending',
  status: 'pending',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
  isTooltip: true,
};

export const DoneStatusCard: Story<StatusCardArgs> = StatusTemplate.bind({});
DoneStatusCard.args = {
  text: 'done',
  status: 'done',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
  isTooltip: true,
};

export const ErrorStatusCard: Story<StatusCardArgs> = StatusTemplate.bind({});
ErrorStatusCard.args = {
  text: 'error',
  status: 'error',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
  isTooltip: true,
};

export const UnknownStatusCard: Story<StatusCardArgs> = StatusTemplate.bind({});
UnknownStatusCard.args = {
  text: 'unknown',
  status: 'unknown',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
};
