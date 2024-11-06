import { useState } from 'react';
import { Story } from '@storybook/react';

import InputDate from './InputDate';

import { InputDateArgs, InputDateStatus, InputDateSize } from './types';

export default {
  title: 'UI KIT/Atoms/Input/InputDate',
  component: InputDate,
  parameter: {
    componentSubtitle: 'InputDate 컴포넌트',
  },
  argTypes: {
    status: {
      options: Object.values(InputDateStatus).map((value: string) => value),
      control: { type: 'select' },
    },
    size: {
      options: Object.values(InputDateSize).map((value: string) => value),
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
  },
};

const InputDateTemplate = (args: InputDateArgs): JSX.Element => {
  const [val, setVal] = useState<string>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (args.onChange) args.onChange(e);
    setVal(e.target.value);
  };

  return <InputDate {...args} value={val} onChange={onChange} />;
};

export const PrimaryInputNumber: Story<InputDateArgs> = InputDateTemplate.bind(
  {},
);
PrimaryInputNumber.args = {
  status: InputDateStatus.DEFAULT,
  size: InputDateSize.MEDIUM,
  disabled: false,
  isReadOnly: false,
  placeholder: 'placeholder',
  customSize: {},
};
