import { atom } from 'recoil';

import type { MyWorkDashboardResponseModel } from '@src/pages/MyWorkDashboardPage/hooks/useGetMyWorkOverview';

import type { useGetProjectMetaDataResponseModel } from '@src/hooks/Api/useGetProjectMetaData';

export type ProjectDashboardPageAtomModel = {
  projectMetaData: useGetProjectMetaDataResponseModel;
  pageData: MyWorkDashboardResponseModel;
};

export const projectDashboardPageAtom = atom<ProjectDashboardPageAtomModel>({
  key: '@/components/pageContents/myWorkDashboardContents',
  default: {
    projectMetaData: {
      id: Infinity,
      name: '',
      description: '',
      workspaceId: Infinity,
      createdAt: '',
      updatedAt: '',
      mobile: Infinity,
      type: Infinity,
      ownerId: Infinity,
      workflow: Infinity,
      dataId: Infinity,
      autoSync: Infinity,
      lastSyncDate: '',
      autoSetting: 0,
    },
    pageData: {
      guide: [],
      labelingInfo: {
        complete: {
          count: 0,
          new: 0,
        },
        labeling: {
          count: 0,
          new: 0,
        },
        reject: {
          count: 0,
          new: 0,
        },
        review: {
          count: 0,
          new: 0,
        },
      },
      labelingRatio: {
        labeling: 0,
        reject: 0,
      },
      projectInfo: {
        annotation: [],
        createdDate: '',
        description: '',
        mobile: 0,
        owner: '',
        title: '',
        type: '',
        workflow: 1,
      },
      reviewRatio: {
        review: 0,
        reject: 0,
      },
      reviewInfo: {
        complete: {
          count: 0,
          new: 0,
        },
        relabeling: {
          count: 0,
          new: 0,
        },
        review: {
          count: 0,
          new: 0,
        },
      },
      title: '',
    },
  },
});
