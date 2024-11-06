import { useState } from 'react';
import { Story } from '@storybook/react';

import Switch from './Switch';
import { SwitchArgs, SwitchInit, SwitchSize, initialLabelAlign } from './types';

export default {
  title: 'UI KIT/Atoms/Button/Switch',
  component: Switch,
  parameters: {
    componentSubtitle: 'Switch 컴포넌트',
  },
  argTypes: {
    size: {
      options: Object.values(SwitchSize).map((value: string): string => value),
      control: { type: 'radio' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    onChange: { action: '클릭' },
    checked: { control: { disable: true } },
    labelAlign: {
      options: Object.values(initialLabelAlign).map(
        (value: string): string => value,
      ),
      control: { type: 'radio' },
    },
  },
};

const SwitchButtonTemplate = (args: SwitchArgs): JSX.Element => {
  const [checked, setChecked] = useState<boolean>(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (args.onChange) args.onChange(e);
    setChecked(!checked);
  };

  return <Switch {...args} checked={checked} onChange={onChange} />;
};

export const PrimarySwitch: Story<SwitchArgs> = SwitchButtonTemplate.bind({});
PrimarySwitch.args = {
  size: SwitchSize.MEDIUM,
  disabled: SwitchInit.disabled,
  label: SwitchInit.label,
  customStyle: {},
};
