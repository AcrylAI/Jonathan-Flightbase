import { ProjectMemberManageContent } from '../../../components/organisms/Modal/common/Contents/MemberManageContent/ProjectMemberManageContent';
import { atom } from 'recoil';

interface ProjectModalDefaultModel {
  title: string;
  dataType: number;
  tools: Array<number>;
  workStep: boolean;
  mobile: number;
  desc?: string;
  guideLine: Array<File>;
  titleValid: boolean;
}

interface ProjectModalInviteModel {
  memberList: ProjectMemberManageContent;
}
export interface ProjectModalDatasetPathModel {
  name: string;
  path: string;
  type: string;
  subCnt: number;
  fileCnt: number;
  viewPath: string;
  list?: Array<ProjectModalDatasetPathModel>;
  selected?: boolean;
  expended?: boolean;
}
export interface ProjectModalDatasetModel {
  list: Array<ProjectModalDatasetPathModel>;
  selectedPath: string;
  viewPath: string;
  fileCount: number;
}
const ProjectModalDatasetModelDefaultValue: ProjectModalDatasetModel = {
  list: [],
  selectedPath: '',
  viewPath: '',
  fileCount: 0,
};

export interface ProjectModalClassItemModel {
  id?: number;
  deleted?: number;
  color: string;
  name: string;
  tool: number;
  props: Array<ProjectModalPropModel>;
}
export interface ProjectModalPropOptModel {
  id?: number;
  deleted?: number;
  selected: boolean;
  title: string;
}

export interface ProjectModalPropModel {
  id?: number;
  deleted?: number;
  options: Array<ProjectModalPropOptModel>;
  title: string;
  selectType: number;
  required: number;
}
export interface ProjectModalClassModel {
  list: Array<ProjectModalClassItemModel>;
}

export interface ProjectModalAtomModel {
  default: ProjectModalDefaultModel;
  invite: ProjectModalInviteModel;
  dataset: ProjectModalDatasetModel;
  class: ProjectModalClassModel;
}
export interface ProjectModalCtlAtomModel {
  mode: number;
  step: number;
  scroll: 'top' | 'bottom' | 'none';
  modalKey: string;
}

const ProjectModalAtomDefaultValue: ProjectModalAtomModel = {
  default: {
    title: '',
    dataType: -1,
    tools: [1, 2],
    workStep: false,
    mobile: 0,
    guideLine: [],
    titleValid: false,
  },
  invite: {
    memberList: {
      selectedList: [],
      userList: [],
    },
  },
  dataset: ProjectModalDatasetModelDefaultValue,
  class: { list: [] },
};

const ProjectModalCtlAtomDefaultValue: ProjectModalCtlAtomModel = {
  mode: 0,
  step: 0,
  scroll: 'none',
  modalKey: `@component/Modal/ProjectModal/modalKey`,
};
export const ProjectModalAtom = atom<ProjectModalAtomModel>({
  default: ProjectModalAtomDefaultValue,
  key: '@components/Modal/ProjectModalAtom',
});

export const ProjectModalCtlAtom = atom<ProjectModalCtlAtomModel>({
  default: ProjectModalCtlAtomDefaultValue,
  key: '@components/Modal/ProjectModalCtlAtom',
});
