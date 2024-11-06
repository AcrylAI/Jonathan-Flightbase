import { useState } from 'react';
import { Story } from '@storybook/react';

import Checkbox from './Checkbox';
import { CheckboxArgs, CheckboxInit } from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Button/Checkbox',
  component: Checkbox,
  parameters: {
    componentSubtitle: '체크박스 컴포넌트',
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
    label: {
      control: {
        type: 'text',
      },
    },
    onChange: { action: '클릭' },
    checked: { control: { disable: true } },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const CheckboxTemplate = (args: CheckboxArgs): JSX.Element => {
  const [checked, setChecked] = useState<boolean>(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (args.onChange) args.onChange(e);
    setChecked(!checked);
  };

  return <Checkbox {...args} checked={checked} onChange={onChange} />;
};

export const PrimaryCheckbox: Story<CheckboxArgs> = CheckboxTemplate.bind({});
PrimaryCheckbox.args = {
  disabled: CheckboxInit.disabled,
  label: CheckboxInit.label,
};
