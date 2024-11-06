import Button from '@src/components/atoms/button/Button';
import { Story } from '@storybook/react';

import ModalRender from './ModalRender/ModalRender';
import ModalContentMockup from '../Mockup/Content';
import { useModal } from '@src/hooks/useModal';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/FlexibleModal/ModalRender',
  component: ModalRender,
  parameters: {
    componentSubtitle: 'ModalRender',
  },
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const ModalRenderTemplate = (): JSX.Element => {
  const { createModal, modalKey, modalList } = useModal();

  const onClickCreateModal = () => {
    createModal({
      title: '모달테스트',
      fullscreen: true,
      content: <ModalContentMockup modalKey={modalKey} />,
    });
  };

  return (
    <>
      <Button type='primary' onClick={onClickCreateModal}>
        Flexible Modal open
      </Button>
      <ModalRender modalList={modalList} />
    </>
  );
};

export const defaultRender: Story = ModalRenderTemplate.bind({});

/*
DefaultModal.args = {
  topAnimation: '50px',
};
*/
