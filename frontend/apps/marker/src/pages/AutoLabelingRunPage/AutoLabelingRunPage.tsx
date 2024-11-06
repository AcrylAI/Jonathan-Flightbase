import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import _ from 'lodash';

import { AutoLabelingRunPageAtom } from '@src/stores/components/pageContents/AutoLabelingRunPageAtom';

import useGetClassList from '../AutoLabelingSetPage/hooks/useGetClassList';

// Modal
import RunAutoLabelingModal from '@src/components/organisms/Modal/AutoLabelingModal/RunAutoLabelingModal';
import StopAutoLabelingModal from '@src/components/organisms/Modal/StopAutoLabelingModal/StopAutoLabelingModal';

// Components
import AutoLabelingRunContents from '@src/components/pageContents/AutoLabelingRunContents/AutoLabelingRunContents';
import useGetAutoLabelingRunCheck from '@src/components/pageContents/ProjectDashboardContents/SettingWidget/RunAutoLabel/hooks/useGetAutoLabelingRunCheck';

// types
import type { useGetProjectMetaDataResponseModel } from '@src/hooks/Api/useGetProjectMetaData';
import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';
import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useModal from '@src/hooks/Modal/useModal';

// Fetch hooks
import useFetchAutolabelingGraph from './hooks/useFetchAutolabelingGraph';
import { UseFetchAutolabelingGraphResModel } from './hooks/useFetchAutolabelingGraph';
import type { AutoLabelingRunResModel } from './hooks/useFetchAutolabelingList';
import useFetchAutolabelingList from './hooks/useFetchAutolabelingList';

function AutoLabelingRunPage() {
  const { pid: projectId } = useParams();
  const modal = useModal();
  const recentClickedIdx = useRef<number>(Infinity);
  const [isAutoLabeling, setIsAutoLabeling] = useState<boolean>(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
  });
  const setAutoLabelingRunAtom =
    useSetRecoilState<AutoLabelingRunPageAtom.AutoLabelingRunPageAtomModel>(
      AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
    );
  const { data: classList } = useGetClassList({
    projectId: Number(projectId),
  });

  const {
    data,
    refetch: checkRefetch,
    isRefetching: isCheckRefetching,
  } = useGetAutoLabelingRunCheck({
    projectId: Number(projectId),
  });
  const reset = useResetRecoilState(
    AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
  );

  // Request ProjectOwner
  const isProjectOwner = useGetIsProjectOwner({
    projectId: Number(projectId),
  });

  // Request AutoLabelingRun List
  const getAutolabingRunList = (list: Array<AutoLabelingRunResModel>) => {
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      newState.autoLabelingRunList = list;
      return newState;
    });
  };
  const { refetch: listRefetch, isLoading: listLoading } =
    useFetchAutolabelingList(
      { projectId: Number(projectId) },
      {
        getAutolabingRunList,
      },
    );

  // Request Project Meta data
  const getProjectMetaData = (data: useGetProjectMetaDataResponseModel) => {
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      newState.projectMetaData = data;
      return newState;
    });
  };
  useGetProjectMetaData(
    { projectId: Number(projectId) },
    { getData: getProjectMetaData },
  );

  // Request AutoLabelingGraph
  const getAutoLabelingGraph = (
    response: UseFetchAutolabelingGraphResModel,
    autolabelId: number,
  ) => {
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      const barGraphMap: { [key: string]: number } = {};

      const barGraph = response.data.map((cur) => {
        if (barGraphMap[cur.className] === undefined) {
          barGraphMap[cur.className] = 0;
        } else {
          barGraphMap[cur.className]++;
        }

        return {
          ...cur,
          className: `${cur.className}${barGraphMap[cur.className]}`,
          xText: cur.className,
        };
      });

      newState.graph[String(autolabelId)] = {
        donut: {
          category: 'className',
          value: 'data',
          name: 'className',
          totalDataLabel: 'Total Data',
          totalData: response.totalData,
          data: response.data,
        },
        bar: {
          category: 'className',
          value: 'data',
          name: 'className',
          xText: 'xText',
          data: barGraph,
          blockKey: '',
        },
      };
      newState.loading.graph.delete(autolabelId);
      return newState;
    });
  };
  useFetchAutolabelingGraph(
    {
      autolabelId: recentClickedIdx.current,
    },
    { getData: getAutoLabelingGraph },
  );

  // Open AutoLabelingRun Modal
  const onClickRunAutoLabeling = () => {
    modal.createModal({
      title: 'Run AutoLabeling',
      content: (
        <RunAutoLabelingModal
          projectId={Number(projectId)}
          refetch={() => {
            listRefetch();
            checkRefetch();
          }}
        />
      ),
    });
  };

  // Stop AutoLabeling
  const onClickStopAutolabeling = (rowData: AutoLabelingRunResModel) => {
    modal.createModal({
      title: 'Stop AutoLabeling',
      size: 'md',
      content: (
        <StopAutoLabelingModal
          rowData={rowData}
          projectId={Number(projectId)}
          refetch={() => {
            listRefetch();
            checkRefetch();
          }}
        />
      ),
    });
  };

  // Append Graph Card
  const handleGraphAppend = async (id: number) => {
    recentClickedIdx.current = id;
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      if (newState.listAppendIdx.has(id)) {
        newState.listAppendIdx.delete(id);
      } else {
        newState.listAppendIdx.add(id);
      }
      if (!autoLabelingRunAtom.graph[id]) {
        newState.listAppendIdx.add(id);
        newState.loading.graph.add(id);
      }
      return newState;
    });
  };

  // Check AutoLabeling is presence autolabeling
  const handleIsAutoLabeling = () => {
    if (data?.status) {
      setIsAutoLabeling(data.result.autolabeling === 1);
    }
  };

  const resizeHandler = () => {
    setWindowSize({
      width: window.innerWidth,
    });
  };

  useEffect(() => {
    handleIsAutoLabeling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isCheckRefetching]);

  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      newState.loading.list = listLoading;
      return newState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listLoading]);

  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    setAutoLabelingRunAtom((autoLabelingRunAtom) => {
      const newState = _.cloneDeep(autoLabelingRunAtom);
      if (
        Array.isArray(classList?.result) &&
        (classList?.result as any).length > 0
      ) {
        newState.isClassList = true;
      }
      newState.loading.classList = false;

      return newState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classList?.result]);

  return (
    <AutoLabelingRunContents
      isProjectOwner={isProjectOwner}
      isAutoLabeling={isAutoLabeling}
      windowSize={windowSize}
      onClickRunAutoLabeling={onClickRunAutoLabeling}
      onClickStopAutolabeling={onClickStopAutolabeling}
      handleGraphAppend={handleGraphAppend}
    />
  );
}

export default AutoLabelingRunPage;
