import { Story } from '@storybook/react';

import Tooltip from './Tooltip';
import {
  horizontalAlign,
  verticalAlign,
  iconAlign,
  tooltipType,
  TooltipArgs,
} from './types';

import alert from '@src/static/images/icons/00-ic-alert-info-o.svg';

export default {
  title: 'UI KIT/Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    componentSubtitle: 'Tooltip 컴포넌트',
  },
  argTypes: {
    iconAlign: {
      options: Object.values(iconAlign).map((value: string): string => value),
      control: { type: 'radio' },
    },
    horizontalAlign: {
      options: Object.values(horizontalAlign).map(
        (value: string): string => value,
      ),
      control: { type: 'radio' },
    },
    verticalAlign: {
      options: Object.values(verticalAlign).map(
        (value: string): string => value,
      ),
      control: { type: 'radio' },
    },
    type: {
      options: Object.values(tooltipType).map((value: string): string => value),
      control: { type: 'radio' },
    },
  },
};

const TooltipTemplate = (args: TooltipArgs) => {
  const contentsAlign = {
    vertical: args.verticalAlign,
    horizontal: args.horizontalAlign,
  };

  return <Tooltip contentsAlign={contentsAlign} {...args} />;
};

export const PrimaryTooltip: Story<TooltipArgs> = TooltipTemplate.bind({});
PrimaryTooltip.args = {
  icon: alert,
  iconAlign: iconAlign.LEFT,
  label: 'label',
  contents: 'contents',
  title: 'title',
  verticalAlign: verticalAlign.BOTTOM,
  horizontalAlign: horizontalAlign.LEFT,
  type: tooltipType.LIGHT,
};
