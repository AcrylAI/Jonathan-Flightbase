import { useState } from 'react';
import { Story } from '@storybook/react';

import InputNumber from './InputNumber';

import {
  InputNumberArgs,
  InputNumberStatus,
  InputNumberSize,
  InputNumberDataType,
} from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Input/InputNumber',
  component: InputNumber,
  parameter: {
    componentSubtitle: 'InputNumber 컴포넌트',
  },
  argTypes: {
    status: {
      options: Object.values(InputNumberStatus).map((value: string) => value),
      control: { type: 'select' },
    },
    size: {
      options: Object.values(InputNumberSize).map((value: string) => value),
      control: { type: 'radio' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    isReadOnly: {
      control: { type: 'boolean' },
    },
    onChange: { action: '입력' },
    value: { control: { disable: true } },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const InputNumberTemplate = (args: InputNumberArgs): JSX.Element => {
  const [val, setVal] = useState<number>(1);
  const onChange = (
    data: InputNumberDataType,
    e?: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setVal(Number(data.value));
    if (args.onChange) args.onChange(e);
  };

  return <InputNumber {...args} value={val} onChange={onChange} />;
};

export const PrimaryInputNumber: Story<InputNumberArgs> =
  InputNumberTemplate.bind({});
PrimaryInputNumber.args = {
  status: InputNumberStatus.DEFAULT,
  size: InputNumberSize.MEDIUM,
  isDisabled: false,
  isReadOnly: false,
  placeholder: 'placeholder',
  name: 'inputNumber',
  max: 100,
  min: -1,
  step: 1,
  customSize: {},
  theme: theme.PRIMARY_THEME,
};
