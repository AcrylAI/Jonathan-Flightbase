import { CLASS_COLOR_SET } from '@src/utils/color';
import { atom } from 'recoil';

type AutoLabelingListModel = {
  id: number;
  active: number;
  modelName: string;
  deploymentName: string;
  type: 1 | 2;
};

export type RegisteredClassModel = {
  id: number;
  name: string;
  color: string;
  tool: number;
};
export type MatchClassModel = {
  tool: number;
  color: string;
  classId: number;
  className: string;
  modelClassName: Array<string>;
  modelName: string;
  modelId: number;
  deployName: string;
};

export type SetAutoLabelModalAtomModel = {
  isLoading: boolean;
  autolabelingList: Array<AutoLabelingListModel>;
  registeredClass: Array<RegisteredClassModel>;
  matchClassList: Array<MatchClassModel>;
  modelClassList: Array<string>;
  modelClassSearch: string;
  matchClassSearch: string;
  projectTools: Array<number>;
  selectedModel: number;
  selectedModelClass: Array<string>;
  selectedMatchClass: string; // 새로 생성된 클래스는 id가 없어서 string으로 비교
  colorCounter: number;
};

const SetAutoLabelModalAtom = atom<SetAutoLabelModalAtomModel>({
  key: '@/src/store/Modal/SetAutoLabelModalAtom',
  default: {
    isLoading: true,
    autolabelingList: [],
    registeredClass: [],
    matchClassList: [],
    modelClassList: [],
    projectTools: [],
    selectedModel: 0,
    selectedModelClass: [],
    selectedMatchClass: '',
    modelClassSearch: '',
    matchClassSearch: '',
    colorCounter: 12,
  },
});
export default SetAutoLabelModalAtom;
