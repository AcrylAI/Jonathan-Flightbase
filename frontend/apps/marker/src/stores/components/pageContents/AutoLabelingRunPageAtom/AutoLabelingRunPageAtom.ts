import { atom } from 'recoil';

import { AutoLabelingRunResModel } from '@src/pages/AutoLabelingRunPage/hooks/useFetchAutolabelingList';

import type { BarChartDataType } from '@src/components/molecules/charts/BarChart';

import type { DataType as DonutChartDataType } from '@src/components/pageContents/AutoLabelingRunContents/DonutChart/types';

import type { useGetProjectMetaDataResponseModel } from '@src/hooks/Api/useGetProjectMetaData';

type AutoLabelingRunPageAtomModel = {
  projectMetaData: useGetProjectMetaDataResponseModel;
  autoLabelingRunList: Array<AutoLabelingRunResModel>;
  listAppendIdx: Set<number>;
  graph: {
    [id: string]: {
      donut: DonutChartDataType;
      bar: BarChartDataType;
    };
  };
  loading: {
    list: boolean;
    graph: Set<number>;
    classList: boolean;
  };
  isClassList: boolean;
};

export const autoLabelingRunPageAtom = atom<AutoLabelingRunPageAtomModel>({
  key: '@/components/pages/ProjectAutoLabelingRunPage',
  default: {
    projectMetaData: {
      id: Infinity,
      name: '',
      autoSetting: 0,
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
    },
    listAppendIdx: new Set<number>(),
    autoLabelingRunList: [],
    graph: {},
    loading: {
      list: true,
      graph: new Set<number>(),
      classList: true,
    },
    isClassList: false,
  },
});

export type { AutoLabelingRunPageAtomModel };
