import { useState } from 'react';
import { Story } from '@storybook/react';
import Radio from './Radio';
import { RadioArgs, mockData } from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Button/Radio',
  component: Radio,
  parameters: {
    componentSubtitle: '라디오 버튼 컴포넌트',
  },
  argTypes: {
    onChange: {
      action: '클릭',
    },
    selectedValue: {
      control: {
        type: 'disable',
      },
    },
    isReadOnly: {
      control: {
        type: 'boolean',
      },
    },
    t: {
      control: {
        type: 'disable',
      },
    },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const RadioInputTemplate = (args: RadioArgs): JSX.Element => {
  const [selectedValue, setSelectedValue] = useState(args.options[0].value);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (args.onChange) args.onChange(e);
    const { value } = e.currentTarget;
    setSelectedValue(Number(value));
  };

  return <Radio {...args} selectedValue={selectedValue} onChange={onChange} />;
};

export const PrimaryRadio: Story<RadioArgs> = RadioInputTemplate.bind({});
PrimaryRadio.args = {
  options: mockData,
  // isReadonly: true,
  name: 'name',
};
