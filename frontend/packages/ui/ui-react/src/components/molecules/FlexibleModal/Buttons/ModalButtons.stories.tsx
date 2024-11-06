import { Story } from '@storybook/react';
import ModalButtons from './ModalButtons';
import { ModalButtonsArgs } from '../types';

export default {
  title: 'UI KIT/Molecules/FlexibleModal/Buttons',
  component: ModalButtons,
  parameters: {
    componentSubtitle: 'ModalButtons',
  },
  argTypes: {},
};

const Buttons = (props: ModalButtonsArgs) => {
  return <ModalButtons {...props} />;
};

export const DefaultButtons: Story<ModalButtonsArgs> = Buttons.bind({});

DefaultButtons.args = {
  okButton: {
    title: '확인',
  },
  cancelButton: {
    title: '취소',
  },
  prevButton: {
    title: '이전',
    disabled: true,
  },
  nextButton: {
    title: '다음',
  },
};
