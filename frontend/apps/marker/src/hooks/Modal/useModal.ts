import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { ModalTemplateArgs } from '@jonathan/ui-react/src/components/molecules/FlexibleModal/types';

import {
  ModalActionAtom,
  ModalActionType,
  ModalAtom,
  ModalSelector,
} from './../../stores/components/Modal/ModalAtom';

export type CreateModalArgs = {
  size?: 'lg' | 'md' | 'sm';
  title: string;
  control?: boolean;
  content: JSX.Element;
  minimize?: boolean;
  fullscreen?: boolean;
  startFullscreen?: boolean;
};

function useModal() {
  const [modalList, setModalList] = useRecoilState(ModalAtom);
  const path = useLocation().pathname;
  const [location, setLocation] = useState<string>(path);
  const setModalSelector = useSetRecoilState(ModalSelector);
  const setModalAction = useSetRecoilState(ModalActionAtom);

  // modal state
  const isOpen: boolean = false;
  const isMinimize: boolean = false;
  const isMaximize: boolean = false;

  const modalKey = `modal ${new Date().getMilliseconds()}-${
    Math.floor(Math.random() * 100) + 1
  }`;

  const createModal = ({
    size,
    title,
    control,
    content,
    minimize,
    fullscreen,
    startFullscreen,
  }: CreateModalArgs) => {
    const onClickClose = () => {
      const action: ModalActionType = {
        action: 'POP',
        modalKey,
      };
      setModalAction(action);
      setModalSelector(modalList);
    };

    const onClickMaximize = (modalKey: string) => {
      const action: ModalActionType = {
        action: 'MAXIMIZE',
        modalKey,
      };
      setModalAction(action);
      setModalSelector(modalList);
    };

    const onClickMinimize = (modalKey: string) => {
      const action: ModalActionType = {
        action: 'MINIMIZE',
        modalKey,
      };
      setModalAction(action);
      setModalSelector(modalList);
    };
    const onClickFullScreen = (modalKey: string) => {
      const action: ModalActionType = {
        action: 'FULLSCREEN',
        modalKey,
      };
      setModalAction(action);
      setModalSelector(modalList);
    };

    // ui react 에 추가되어 후에 삭제해도 무관한 로직
    const checkControl = () => {
      if (control === undefined || control === null) return true;
      return control;
    };
    // 시작시 fullscreen을 위한값 모달내부에도 선언되어있지만, 추가선언
    // 후에 modal 내부의 startFullscreen 로직 제거 예정
    const isFullScreen: boolean = startFullscreen ?? false;

    const modal: ModalTemplateArgs = {
      onClickClose,
      onClickMinimize,
      onClickMaximize,
      onClickFullScreen,
      size,
      title,
      control: checkControl(),
      content,
      modalKey,
      isOpen,
      isMinimize,
      isMaximize,
      minimize,
      isFullScreen: isMobile && !startFullscreen ? false : isFullScreen,
      fullscreen: isMobile ? false : fullscreen,
      startFullscreen,
    };
    let temp = _.cloneDeep(modalList);
    temp = [...modalList, modal];
    setModalList(temp);
  };

  const closeAll = () => {
    const action: ModalActionType = {
      action: 'CLOSE_ALL',
      modalKey,
    };

    setModalAction(action);
    setModalSelector(modalList);
  };

  const close = () => {
    const action: ModalActionType = {
      action: 'POP',
      modalKey,
    };

    setModalAction(action);
    setModalSelector(modalList);
  };
  const handleScroll = () => {
    if (modalList.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  };
  const handleLocation = () => {
    if (path !== location) {
      closeAll();
    }
  };

  useEffect(() => {
    handleScroll();
  }, [modalList.length]);

  useEffect(() => {
    handleLocation();
  }, [path]);

  return {
    createModal,
    closeAll,
    close,
    modalList,
    modalKey,
  };
}

useModal.defaultProps = {
  control: true,
  minimize: false,
  fullScreen: false,
  startFullscreen: false,
};
export default useModal;
