import { ModalTemplateArgs } from '@jonathan/ui-react/src/components/molecules/FlexibleModal/types';
import _ from 'lodash';
import { atom, selector } from 'recoil';

export const ModalAtom = atom<Array<ModalTemplateArgs>>({
  default: [],
  key: '@components/Modal',
});

export interface ModalActionType {
  modalKey: string;
  action:
    | 'POP'
    | 'MINIMIZE'
    | 'MAXIMIZE'
    | 'CLOSE_ALL'
    | 'CLOSE'
    | 'FULLSCREEN';
}

export const ModalActionAtom = atom<ModalActionType>({
  key: '@components/Modal/ModalAction',
  default: {
    modalKey: '',
    action: 'POP',
  },
});

export const ModalSelector = selector<Array<ModalTemplateArgs>>({
  key: '@components/Modal/ModalSelector',
  get: ({ get }) => get(ModalAtom),
  set: ({ get, set }) => {
    const temp = _.cloneDeep(get(ModalAtom));
    const { modalKey, action } = get(ModalActionAtom);
    switch (action) {
      case 'POP':
        temp.pop();
        break;
      case 'FULLSCREEN':
        {
          const fIdx = temp.findIndex((v) => v.modalKey === modalKey);
          if (fIdx !== -1) {
            temp[fIdx].isFullScreen = !temp[fIdx].isFullScreen;
          }
        }
        break;
      case 'MINIMIZE':
        {
          const fIdx = temp.findIndex((v) => v.modalKey === modalKey);
          if (fIdx !== -1) {
            temp[fIdx].isMinimize = true;
            temp[fIdx].isMaximize = false;
          }
        }
        break;
      case 'MAXIMIZE':
        {
          const fIdx = temp.findIndex((v) => v.modalKey === modalKey);
          if (fIdx !== -1) {
            temp[fIdx].isMinimize = false;
            temp[fIdx].isMaximize = true;
          }
        }
        break;
      case 'CLOSE_ALL':
        temp.splice(0, temp.length);
        break;
      case 'CLOSE':
        {
          const fIdx = temp.findIndex((v) => v.modalKey === modalKey);
          if (fIdx !== -1) temp.splice(fIdx, 1);
        }
        break;
      default:
    }

    set(ModalAtom, temp);
  },
});
