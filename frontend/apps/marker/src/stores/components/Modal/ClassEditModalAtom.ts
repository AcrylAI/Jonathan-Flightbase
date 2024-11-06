import { atom } from 'recoil';
import { ProjectModalClassModel } from './ProjectModalAtom';

export interface ClassEditModalAtomModel extends ProjectModalClassModel {}

export const classEditModalAtom = atom<ClassEditModalAtomModel>({
  key: '@components/Modal/ClassEditModal/classEditAtom',
  default: {
    list: [],
  },
});
