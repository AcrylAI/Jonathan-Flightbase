/* eslint-disable camelcase */
import { atom } from 'recoil';

export interface ClassContentsClassModel {
  color: string;
  deleted: number;
  depth: number;
  id: number;
  name: string;
  parent_id: null | number;
  project_id: number;
  required: number;
  selection: number;
  sort_num: number;
  status: number;
  tool: number;
}
export interface ClassContentsPropModel {
  id: number;
  name: string;
  type: number;
  required: number;
  deleted: number;
  options: Array<ClassContentsOptionModel>;
}
export interface ClassContentsOptionModel {
  id: number;
  name: string;
  deleted: number;
}

export interface ClassPageContentsAtomModel {
  classList: Array<ClassContentsClassModel>;
  selected: number;
}

export const ClassPageContentsAtom = atom<ClassPageContentsAtomModel>({
  key: '@/components/pageContents/ClassPageContents',
  default: {
    classList: [],
    selected: 0,
  },
});
