import { atom } from 'recoil';

export interface ProjectsContentsAtomModel {
  filter1?: 0 | 1 | 2;
  filter2?: 0 | 1 | 2;
  search?: string | undefined;
  workspaceId: number;
  // page?: number;
}

export const ProjectsContentsAtom = atom<ProjectsContentsAtomModel>({
  key: '@/components/pageContents/ProjectsContents',
  default: {
    filter1: 0,
    filter2: 0,
    search: '',
    workspaceId: 0,
    // page: 1,
  },
});
