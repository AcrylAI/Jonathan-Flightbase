import { atom } from 'recoil';
import { ProjectModalDatasetModel } from './ProjectModalAtom';

export interface ConnectDataSetModalAtomModel
  extends ProjectModalDatasetModel {}

const ConnectDataSetModalAtomDefaultValue: ConnectDataSetModalAtomModel = {
  list: [],
  selectedPath: '',
  viewPath: '',
};
export const ConnectDataSetModalAtom = atom<ConnectDataSetModalAtomModel>({
  key: '@/src/components/organisms/Modal/ConnectDataSetModalAtom',
  default: ConnectDataSetModalAtomDefaultValue,
});
