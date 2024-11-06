import { atom } from 'recoil';

export type RunAutoLabelClassType = {
  classId: number;
  color: string;
  modelId: number;
  name: string;
  tool: 1 | 2;
};
export type RunAutoLabelDataType = {
  overall: number;
  unworked: number;
};
export type RunAutoLabelModelType = {
  active: 0 | 1;
  deploy: string;
  id: number;
  model: string;
  type: 1 | 2;
};
export type RunAutoLabelModalAtomModel = {
  classList: Array<RunAutoLabelClassType>;
  modelList: Array<RunAutoLabelModelType>;
  keepData: number;
  data: RunAutoLabelDataType;
  dataType: number;
  keepDataType: number;
  dataCnt: number;
  selectedModel: number;
  isLoading: boolean;
};
const RunAutoLabelModalAtom = atom<RunAutoLabelModalAtomModel>({
  key: '@/src/store/Modal/RunAutoLabelModalAtom',
  default: {
    classList: [],
    modelList: [],
    keepData: 0,
    data: {
      overall: 0,
      unworked: 0,
    },
    dataType: 0,
    keepDataType: 0,
    dataCnt: 0,
    selectedModel: 0,
    isLoading: true,
  },
});
export default RunAutoLabelModalAtom;
