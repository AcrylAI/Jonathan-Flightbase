import { useState } from 'react';
import { Story } from '@storybook/react';

import InputText from './InputText';
import { InputSize, InputStatus, InputTextArgs } from './types';

import closeIcon from '@src/static/images/icons/close-c.svg';
import leftIcon from '@src/static/images/icons/ic-search.svg';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Input/InputText',
  component: InputText,
  parameters: {
    componentSubtitle: 'InputText 컴포넌트',
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
    disableLeftIcon: {
      control: { type: 'boolean' },
    },
    disableRightIcon: {
      control: { type: 'boolean' },
    },
    disableClearBtn: {
      control: { type: 'boolean' },
    },
    value: {
      control: {
        disable: true,
      },
    },
    onChange: { action: '텍스트 입력' },
    onClear: { action: '텍스트 삭제' },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const InputTextTemplate = (args: InputTextArgs): JSX.Element => {
  const [val, setVal] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (args.onChange) args.onChange(e);
    setVal(value);
  };

  const onClear = (e?: HTMLInputElement) => {
    if (args.onClear && e) args.onClear(e);
    setVal('');
  };

  return (
    <InputText {...args} value={val} onChange={onChange} onClear={onClear} />
  );
};

export const PrimaryInputText: Story<InputTextArgs> = InputTextTemplate.bind(
  {},
);
PrimaryInputText.args = {
  status: InputStatus.DEFAULT,
  size: InputSize.MEDIUM,
  isDisabled: false,
  isReadOnly: false,
  disableClearBtn: false,
  disableLeftIcon: false,
  disableRightIcon: false,
  placeholder: 'placeholder',
  leftIcon,
  rightIcon: leftIcon,
  closeIcon,
  customStyle: {},
  options: {
    maxLength: '50',
  },
  theme: theme.PRIMARY_THEME,
};
