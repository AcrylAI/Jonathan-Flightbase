import { atom } from 'recoil';
import { LabelerCreateModalAtomModel } from './LabelerCreateModalAtom';

export interface LabelerEditModalAtom extends LabelerCreateModalAtomModel {
  id: number;
  passToggle: boolean;
}

export const LabelerEditModalAtom = atom<LabelerEditModalAtom>({
  key: '@/stores/components/Modal/LabelerEditModalAtom',
  default: {
    id: 0,
    name: '',
    memo: '',
    password: '',
    checkPassword: '',
    valid: false,
    passToggle: false,
  },
});
