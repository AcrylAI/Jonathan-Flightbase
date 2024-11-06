import { atom } from 'recoil';

type PopupType = {
  [key: string]: {
    isOpen: boolean;
    options?: any;
  };
};

const popupState = atom<PopupType>({
  key: 'popupState',
  default: {},
});

export { popupState };
export type { PopupType };
