import {
  fmodalCloseAll,
  fmodalFullscreen,
} from './../store/modules/flexibleModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  fmodalClose,
  fmodalMaximize,
  fmodalMinimize,
  fmodalOpen,
} from '@src/store/modules/flexibleModal';
import { ModalTemplateArgs } from '@src/components/molecules/FlexibleModal/types';
import { RootState } from '@src/store/store';

export type CreateModalArgs = {
  title: string;
  fullscreen: boolean;
  content: JSX.Element;
  startOnFullScreen?: boolean;
};

function useModal() {
  const dispatch = useDispatch();
  const modalState = useSelector((state: RootState) => state.fmodal);
  const { modalList } = modalState;

  // modal state
  const isOpen: boolean = false;
  const isMinimize: boolean = false;
  const isMaximize: boolean = false;
  let isFullScreen: boolean = false;

  const modalKey = `modal ${new Date().getMilliseconds()}-${
    Math.floor(Math.random() * 100) + 1
  }`;

  const createModal = ({
    fullscreen,
    title,
    content,
    startOnFullScreen,
  }: CreateModalArgs) => {
    if (startOnFullScreen) isFullScreen = startOnFullScreen;
    const onClickClose = () => {
      const action = { modalKey };
      dispatch(fmodalClose(action));
    };

    const onClickMaximize = () => {
      const action = { modalKey };
      dispatch(fmodalMaximize(action));
    };

    const onClickFullScreen = () => {
      const action = { modalKey };
      dispatch(fmodalFullscreen(action));
    };

    const onClickMinimize = () => {
      const action = { modalKey };
      dispatch(fmodalMinimize(action));
    };
    const modal: ModalTemplateArgs = {
      onClickClose,
      onClickFullScreen,
      onClickMinimize,
      onClickMaximize,
      title,
      content,
      modalKey,
      isOpen,
      fullscreen,
      isMinimize,
      isMaximize,
      isFullScreen,
    };
    const action = { modal };
    dispatch(fmodalOpen(action));
  };

  const closeAll = () => {
    dispatch(fmodalCloseAll());
  };

  const close = (key: string) => {
    const action = { modalKey: key };
    dispatch(fmodalClose(action));
  };

  return {
    createModal,
    closeAll,
    close,
    modalList,
    modalKey,
  };
}
export { useModal };
