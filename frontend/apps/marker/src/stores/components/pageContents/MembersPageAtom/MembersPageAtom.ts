import { atom } from 'recoil';

import type { MultiBarLineChartType } from '@src/components/pageContents/ProjectMembersContents/MultiBarLineChart';

export interface MembersPageAtomModel {
  membersGraph: {
    [key: number]: {
      graphData: MultiBarLineChartType;
    };
  };
}

export const membersPageAtom = atom<MembersPageAtomModel>({
  key: '@/components/pageContents/MembersContents',
  default: {
    membersGraph: {},
  },
});
