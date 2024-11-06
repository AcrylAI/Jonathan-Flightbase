import { Story } from '@storybook/react';
import ModalHeader from './ModalHeader';
import { ModalHeaderArgs } from '../types';

export default {
  title: 'UI KIT/Molecules/FlexibleModal/Header',
  component: ModalHeader,
  parameters: {
    componentSubtitle: 'ModalButtons',
  },
  argTypes: {},
};

const Header = ({ title }: ModalHeaderArgs) => {
  return <ModalHeader title={title} />;
};

export const DefaultHeader: Story<ModalHeaderArgs> = Header.bind({
  title: 'Title',
});

DefaultHeader.args = {
  title: 'Title',
};
