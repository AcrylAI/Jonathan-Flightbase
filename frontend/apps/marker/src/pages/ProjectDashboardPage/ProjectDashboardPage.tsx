import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import _ from 'lodash';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';
import {
  SettingWidgetAtom,
  SettingWidgetAtomType,
} from '@src/stores/components/SettingWidget/SettingWidgetAtom';

import ProjectDashboardContents from '@src/components/pageContents/ProjectDashboardContents';

import type { useGetProjectMetaDataResponseModel } from '@src/hooks/Api/useGetProjectMetaData';
import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import useFetchDashboardGraph, {
  UseFetchDashboardGraphResponseModel,
} from './hooks/useFetchDashboardGraph';
import type { ProjectDashboardResponseModel } from './hooks/useGetProjectOverview';
import useGetProjectOverview from './hooks/useGetProjectOverview';

function ProjectDashboardPage() {
  const { t } = useT();
  const { pid } = useParams();
  const [widgetState, setWidgetState] =
    useRecoilState<SettingWidgetAtomType>(SettingWidgetAtom);
  const modal = useModal();

  const setProjectDashboardAtom =
    useSetRecoilState<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  const projectDashboardReset = useResetRecoilState(
    ProjectDashboardPageAtom.projectDashboardPageAtom,
  );

  const getProjectMetaData = (result: useGetProjectMetaDataResponseModel) => {
    setProjectDashboardAtom((projectDashboardAtom) => {
      const newState = _.cloneDeep(projectDashboardAtom);
      newState.projectMetaData = result;
      return newState;
    });
  };

  const getWorkStatusGraph = (
    response: UseFetchDashboardGraphResponseModel,
  ) => {
    const { doubleDonut, doubleLine } = response;
    setProjectDashboardAtom((projectDashboardAtom) => {
      const newState = _.cloneDeep(projectDashboardAtom);

      newState.workStatusGraph.doubleDonut = {
        approvedLabeling: doubleDonut.approvedLabeling,
        submittedLabeling: doubleDonut.submittedLabeling,
        workInProgress: doubleDonut.workInProgress,
        innerData: [
          {
            category:
              newState.workStatusGraph.doubleDonut.innerData[0].category,
            value: doubleDonut.approvedLabeling,
            name: t('page.dashboardProject.approvedLabeling'),
          },
          {
            category:
              newState.workStatusGraph.doubleDonut.innerData[1].category,
            value: doubleDonut.workInProgress,
            name: t('page.dashboardProject.workInProgress'),
          },
        ],
        outerData: [
          {
            category:
              newState.workStatusGraph.doubleDonut.outerData[0].category,
            value: doubleDonut.submittedLabeling,
            name: t('page.dashboardProject.submittedLabeling'),
          },
          {
            category:
              newState.workStatusGraph.doubleDonut.outerData[1].category,
            value: doubleDonut.workInProgress,
            name: t('page.dashboardProject.workInProgress'),
          },
        ],
        innerDataColors: newState.workStatusGraph.doubleDonut.innerDataColors,
        outerDataColors: newState.workStatusGraph.doubleDonut.outerDataColors,
      };

      newState.workStatusGraph.doubleLine = {
        categoryKey: 'date',
        valueKey1: 'approvedLabeling',
        valueKey2: 'submittedLabeling',
        valueName1: t('page.dashboardProject.approvedLabeling'),
        valueName2: t('page.dashboardProject.submittedLabeling'),
        value1: doubleLine,
        value2: doubleLine,
        color1: newState.workStatusGraph.doubleLine.color1,
        color2: newState.workStatusGraph.doubleLine.color2,
      };

      return newState;
    });
  };

  const getProjectOverviewData = (result: ProjectDashboardResponseModel) => {
    setProjectDashboardAtom((projectDashboardAtom) => {
      const newState = _.cloneDeep(projectDashboardAtom);
      newState.pageData = result;

      const resultGraphMap: { [key: string]: number } = {};

      const workResultGraph = result.workResult.map((cur) => {
        if (resultGraphMap[cur.className] === undefined) {
          resultGraphMap[cur.className] = 0;
        } else {
          resultGraphMap[cur.className]++;
        }

        const deleted = cur?.deleted ?? 0;
        const className = `${cur.className}${resultGraphMap[cur.className]}${
          deleted === 1 ? ' (deleted)' : ''
        }`;
        const xText = `${cur.className}${deleted === 1 ? ' (deleted)' : ''}`;

        return {
          ...cur,
          className,
          xText,
        };
      });

      newState.pageData.workResult = workResultGraph;

      return newState;
    });
  };
  const handleRefetch = () => {
    // 모달이 종료될 시 refetch를 수행한다.
    if (modal.modalList.length === 0) refetch();
  };

  useGetProjectMetaData(
    { projectId: Number(pid) },
    { getData: getProjectMetaData },
  );

  const { refetch } = useGetProjectOverview(
    {
      projectId: Number(pid),
    },
    {
      getData: getProjectOverviewData,
    },
  );
  const handleWidgetState = () => {
    const temp = _.cloneDeep(widgetState);
    temp.refetch = () => {
      refetch();
    };
    setWidgetState(temp);
  };

  useFetchDashboardGraph(
    { projectId: Number(pid) },
    { getData: getWorkStatusGraph },
  );

  useEffect(() => {
    handleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.modalList.length]);

  useEffect(() => {
    handleWidgetState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => projectDashboardReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ProjectDashboardContents />;
}

export default ProjectDashboardPage;
