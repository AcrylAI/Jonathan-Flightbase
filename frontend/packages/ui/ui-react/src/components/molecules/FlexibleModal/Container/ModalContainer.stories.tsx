import { Story } from '@storybook/react';
import ModalContainer from './ModalContainer';
export default {
  title: 'UI KIT/Molecules/FlexibleModal/Container',
  component: ModalContainer,
  parameters: {
    componentSubtitle: 'ModalContainer',
  },
  argTypes: {},
};

const Container = () => {
  return (
    <ModalContainer>
      <div>children component</div>
    </ModalContainer>
  );
};

export const DefaultHeader: Story = Container.bind({});

DefaultHeader.args = {};
