import { atom } from 'recoil';

import { FilterDataType } from '@src/utils/types/data';

export interface AssignModalMemberModel {
  idx: number;
  name: string;
  labelingCnt: number;
  reviewCnt: number;
  assignCnt: number;
  isAssigned: boolean;
  type: 1 | 2;
}

export interface AssignModalAtomModel {
  projectId: number;
  labelerList: Array<AssignModalMemberModel>;
  selectedLabelerList: Array<AssignModalMemberModel>;
  reviewerList: Array<AssignModalMemberModel>;
  selectedReviewerList: Array<AssignModalMemberModel>;
  hasReview: boolean;
  maxLabelCnt: number;
  maxReviewCnt: number;
  notAssignId: Array<number>;
  assignId: Array<number>;
  flag: number;
  filter: Array<FilterDataType>;
}

export const AssignModalAtom = atom<AssignModalAtomModel>({
  key: `@atom/components/Modal/AssignModalAtom`,
  default: {
    filter: [],
    selectedLabelerList: [],
    selectedReviewerList: [],
    labelerList: [],
    reviewerList: [],
    hasReview: false,
    maxLabelCnt: 0,
    maxReviewCnt: 0,
    projectId: 0,
    notAssignId: [],
    assignId: [],
    flag: 1,
  },
});
