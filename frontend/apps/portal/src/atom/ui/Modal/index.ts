import { v1 } from 'uuid';
import { atom } from 'recoil';
import { OneBtnModalProps } from '@src/components/common/Modal/OneBtnModal';

export type ModalKey = 'oneBtnModal';
export type ModalProps = OneBtnModalProps;

export interface ModalModel {
  key: ModalKey;
  props: ModalProps;
}

export const modalStateAtom = atom<ModalModel[]>({
  key: `ui/modal/${v1()}`,
  default: [],
});
