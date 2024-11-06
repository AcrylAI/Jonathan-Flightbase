import { useDispatch, useSelector } from 'react-redux';
import { Story } from '@storybook/react';

import Button from '@src/components/atoms/button/Button';

import Modal from './Modal';
import { ModalArgs } from './types';

import { modalOpen } from '@src/store/modules/modal';
import { RootState } from '@src/store/store';

import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/Modal',
  component: Modal,
  parameters: {
    componentSubtitle: 'Modal',
  },
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const ModalTemplate = (args: ModalArgs): JSX.Element => {
  const dispatch = useDispatch();
  const modalHandler = () => {
    const action = {
      isOpen: true,
      headerRender: Header,
      contentRender: Content,
      footerRender: Footer,
    };
    dispatch(modalOpen(action));
  };

  const { headerProps, contentProps, footerProps, topAnimation, theme } = args;
  const { isOpen, headerRender, contentRender, footerRender } = useSelector(
    (state: RootState) => state.modal,
  );
  return (
    <>
      <Button type='primary' onClick={modalHandler}>
        Modal open
      </Button>
      {isOpen && (
        <Modal
          HeaderRender={headerRender}
          FooterRender={footerRender}
          ContentRender={contentRender}
          headerProps={headerProps}
          contentProps={contentProps}
          footerProps={footerProps}
          topAnimation={topAnimation}
          theme={theme}
        />
      )}
    </>
  );
};

export const DefaultModal: Story<ModalArgs> = ModalTemplate.bind({});
DefaultModal.args = {
  headerProps: {},
  contentProps: {
    testProp1: 2,
    testProp2: 'test',
  },
  footerProps: {},
  topAnimation: '50px',
  theme: theme.PRIMARY_THEME,
};
