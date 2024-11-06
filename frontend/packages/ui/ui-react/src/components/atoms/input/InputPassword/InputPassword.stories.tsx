import { useState } from 'react';
import { Story } from '@storybook/react';

import InputPassword from './InputPassword';
import { InputSize, InputStatus, InputPasswordArgs } from './types';

import leftIcon from '@src/static/images/icons/ic-lock.svg';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Input/InputPassword',
  component: InputPassword,
  parameters: {
    componentSubtitle: 'InputPassword 컴포넌트',
  },
  argTypes: {
    status: {
      options: Object.values(InputStatus).map((value: string): string => value),
      control: { type: 'select' },
    },
    size: {
      options: Object.values(InputSize).map((value: string): string => value),
      control: { type: 'radio' },
    },
    isDisabled: {
      control: { type: 'boolean' },
    },
    isReadOnly: {
      control: { type: 'boolean' },
    },
    disableShowBtn: {
      control: { type: 'boolean' },
    },
    value: {
      control: {
        disable: true,
      },
    },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
    onChange: { action: '비밀번호 입력' },
  },
};

const InputPasswordTemplate = (args: InputPasswordArgs): JSX.Element => {
  const [val, setVal] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (args.onChange) args.onChange(e);
    setVal(value);
  };

  return <InputPassword {...args} value={val} onChange={onChange} />;
};

export const PrimaryInputPassword: Story<InputPasswordArgs> =
  InputPasswordTemplate.bind({});
PrimaryInputPassword.args = {
  status: InputStatus.DEFAULT,
  size: InputSize.MEDIUM,
  isDisabled: false,
  isReadOnly: false,
  disableLeftIcon: false,
  disableShowBtn: false,
  placeholder: 'placeholder',
  leftIcon,
  customStyle: {},
  options: {
    maxLength: '20',
  },
  theme: theme.PRIMARY_THEME,
};
