import { useState } from 'react';
import { Story } from '@storybook/react';

import Textarea from './Textarea';
import { TextareaArgs, TextareaSize, TextareaStatus } from './types';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Input/Textarea',
  component: {
    componentSubtitle: 'Textarea 컴포넌트',
  },
  argTypes: {
    status: {
      options: Object.values(TextareaStatus).map((value: string) => value),
      control: { type: 'select' },
    },
    size: {
      options: Object.values(TextareaSize).map((value: string) => value),
      control: { type: 'radio' },
    },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    isReadOnly: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    onChange: { action: '입력' },
  },
};

const TextareaTemplate = (args: TextareaArgs) => {
  const [val, setVal] = useState<string>('');
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (args.onChange) args.onChange(e);
    setVal(e.target.value);
  };
  return <Textarea {...args} value={val} onChange={onChange} />;
};

export const TextareaPrimary: Story<TextareaArgs> = TextareaTemplate.bind({});
TextareaPrimary.args = {
  status: TextareaStatus.DEFAULT,
  size: TextareaSize.MEDIUM,
  theme: theme.PRIMARY_THEME,
  isDisabled: false,
  isReadOnly: false,
  placeholder: 'place holder',
  customStyle: {},
};
