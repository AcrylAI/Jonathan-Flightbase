import { atom } from 'recoil';

export interface LabelerCreateModalAtomModel {
  name: string;
  password: string;
  memo: string;
  checkPassword: string;
  valid: boolean;
}

export const LabelerCreateModalAtom = atom<LabelerCreateModalAtomModel>({
  key: '@/stores/components/Modal/LabelerCreateModalAtom',
  default: {
    name: '',
    memo: '',
    password: '',
    checkPassword: '',
    valid: false,
  },
});
