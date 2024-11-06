import { Story } from '@storybook/react';

import Button from './Button';
import { ButtonArgs, ButtonType, ButtonSize, ButtonIconAlign } from './types';

import IconImage from '@src/static/images/icons/00-ic-basic-filter-white.svg';
import IconImageArrow from '@src/static/images/icons/00-ic-basic-arrow-02-right-blue.svg';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Atoms/Button/Buttons',
  component: Button,
  parameters: {
    componentSubtitle: 'Button',
  },
  argTypes: {
    type: {
      options: Object.values(ButtonType).map((value: string): string => value),
      control: { type: 'select' },
    },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
    size: {
      options: Object.values(ButtonSize).map((value: string): string => value),
      control: { type: 'radio' },
    },
    children: {
      control: { type: 'text' },
    },
    iconAlign: {
      options: Object.values(ButtonIconAlign).map(
        (value: string): string => value,
      ),
      control: { type: 'radio' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    onClick: { action: '클릭' },
    onMouseOver: { action: 'mouseover' },
    onMouseLeave: { action: 'mouseout' },
  },
};

const ButtonTemplate = (args: ButtonArgs): JSX.Element => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (args.onClick) args.onClick(e);
  };

  const onMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (args.onMouseOver) args.onMouseOver(e);
  };
  const onMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (args.onMouseOut) args.onMouseOut(e);
  };

  return (
    <Button
      {...args}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

export const Primary: Story<ButtonArgs> = ButtonTemplate.bind({});
Primary.args = {
  type: ButtonType.PRIMARY,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const PrimaryReverse: Story<ButtonArgs> = ButtonTemplate.bind({});
PrimaryReverse.args = {
  type: ButtonType.PRIMARY_REVERSE,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const PrimaryLight: Story<ButtonArgs> = ButtonTemplate.bind({});
PrimaryLight.args = {
  type: ButtonType.PRIMARY_LIGHT,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const Red: Story<ButtonArgs> = ButtonTemplate.bind({});
Red.args = {
  type: ButtonType.RED,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const RedReverse: Story<ButtonArgs> = ButtonTemplate.bind({});
RedReverse.args = {
  type: ButtonType.RED_REVERSE,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const RedLight: Story<ButtonArgs> = ButtonTemplate.bind({});
RedLight.args = {
  type: ButtonType.RED_LIGHT,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const Secondary: Story<ButtonArgs> = ButtonTemplate.bind({});
Secondary.args = {
  type: ButtonType.SECONDARY,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const Gray: Story<ButtonArgs> = ButtonTemplate.bind({});
Gray.args = {
  type: ButtonType.GRAY,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const TextUnderline: Story<ButtonArgs> = ButtonTemplate.bind({});
TextUnderline.args = {
  type: ButtonType.TEXT_UNDERLINE,
  size: ButtonSize.MEDIUM,
  icon: IconImageArrow,
  children: 'Go to Rounds',
  disabled: false,
  customStyle: {},
};

export const NoneBorder: Story<ButtonArgs> = ButtonTemplate.bind({});
NoneBorder.args = {
  type: ButtonType.NONE_BORDER,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
};

export const LoadingButton: Story<ButtonArgs> = ButtonTemplate.bind({});
LoadingButton.args = {
  type: ButtonType.PRIMARY,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  disabled: false,
  customStyle: {},
  loading: true,
};

export const Icon: Story<ButtonArgs> = ButtonTemplate.bind({});
Icon.args = {
  type: ButtonType.SECONDARY,
  size: ButtonSize.MEDIUM,
  children: 'Button',
  icon: IconImage,
  iconAlign: ButtonIconAlign.LEFT,
  disabled: false,
  customStyle: {},
};
