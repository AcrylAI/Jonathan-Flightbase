import { atom } from 'recoil';

import type { MultiBarLineChartType } from '@src/components/pageContents/MemberPageContents/ExpandedRow/MultiBarLineChart';

export interface ProjectMembersContentsAtomModel {
  projectId: number;
  membersGraph: {
    graphData: MultiBarLineChartType;
    date: 'daily' | 'monthly';
  };
  selectedId?: number;
  selectedName?: string;
}

const initMembersGraph: {
  graphData: MultiBarLineChartType;
  date: 'daily' | 'monthly';
} = {
  date: 'daily',
  graphData: {
    category: {
      dataKey: '',
    },
    bar1: {
      name: '',
      dataKey: '',
    },
    bar2: {
      name: '',
      dataKey: '',
    },
    line: {
      name: '',
      dataKey: '',
    },
    data: [],
  },
};

export const ProjectMembersContentsAtom = atom<ProjectMembersContentsAtomModel>(
  {
    key: '@/components/pageContents/ProjectMembersContents',
    default: {
      membersGraph: initMembersGraph,
      projectId: 0,
    },
  },
);
