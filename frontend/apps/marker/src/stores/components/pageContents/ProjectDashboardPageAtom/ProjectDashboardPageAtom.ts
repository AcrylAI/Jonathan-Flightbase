import { atom } from 'recoil';

import type { ProjectDashboardResponseModel } from '@src/pages/ProjectDashboardPage/hooks/useGetProjectOverview';

import type { DoubleLineChartDataType } from '@src/components/pageContents/ProjectDashboardContents/WorkStatusCard/DoubleLineChart/types';
import type { RadialBarChartType } from '@src/components/pageContents/ProjectDashboardContents/WorkStatusCard/RadialBarChart/types';

import { BLUE108, LIME602, MONO202 } from '@src/utils/color';

import type { useGetProjectMetaDataResponseModel } from '@src/hooks/Api/useGetProjectMetaData';

import { Color } from '@amcharts/amcharts5';

export type ProjectDashboardPageAtomModel = {
  projectMetaData: useGetProjectMetaDataResponseModel;
  pageData: ProjectDashboardResponseModel;
  workStatusGraph: {
    doubleDonut: RadialBarChartType & {
      workInProgress: number;
      approvedLabeling: number;
      submittedLabeling: number;
    };
    doubleLine: DoubleLineChartDataType;
  };
};

export const projectDashboardPageAtom = atom<ProjectDashboardPageAtomModel>({
  key: '@/components/pageContents/projectDashboardContents',
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
    pageData: {
      dataInfo: {
        autoLabeling: 0,
        complete: 0,
        labeling: 0,
        notWork: 0,
        review: 0,
        total: 0,
        percent: {
          autoLabeling: 0,
          complete: 0,
          labeling: 0,
          notWork: 0,
          review: 0,
        },
      },
      dataset: {
        dataCnt: 0,
        folderName: '',
        folderPath: '',
        name: '',
      },
      member: {
        labeling: 0,
        review: 0,
        total: 0,
      },
      class: [],
      title: '',
      updatedDate: '',
      workInfo: {
        message: '',
      },
      workResult: [],
    },
    workStatusGraph: {
      doubleDonut: {
        workInProgress: 0,
        approvedLabeling: 0,
        submittedLabeling: 0,
        innerData: [
          {
            category: 'approvedLabeling',
            value: 0,
            name: '',
          },
          {
            category: 'workInProgress',
            value: 0,
            name: '',
          },
        ],
        outerData: [
          {
            category: 'submittedLabeling',
            value: 0,
            name: '',
          },
          {
            category: 'workInProgress',
            value: 0,
            name: '',
          },
        ],
        innerDataColors: [
          LIME602 as unknown as Color,
          MONO202 as unknown as Color,
        ],
        outerDataColors: [
          BLUE108 as unknown as Color,
          MONO202 as unknown as Color,
        ],
      },
      doubleLine: {
        categoryKey: 'date',
        valueKey1: 'approvedLabeling',
        valueKey2: 'submittedLabeling',
        valueName1: '',
        valueName2: '',
        value1: [],
        value2: [],
        color1: LIME602 as unknown as Color,
        color2: BLUE108 as unknown as Color,
      },
    },
  },
});
