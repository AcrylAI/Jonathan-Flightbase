import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import type { ProjectMembersContentsAtomModel } from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';
import { ProjectMembersContentsAtom } from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';

import useGetProjectMembers from '@src/pages/ProjectMembersPage/hooks/useGetProjectMembers';

import { ProjectMembersContents } from '@src/components/pageContents';
import type { MultiBarLineChartType } from '@src/components/pageContents/MemberPageContents/ExpandedRow/MultiBarLineChart';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import type { GetUserGraphResponseModel } from './hooks/useGetUserGraph';
import useGetUserGraph from './hooks/useGetUserGraph';

const ProjectMembersPage = () => {
  const { t } = useT();
  const {
    userSession: { isAdmin, user },
  } = useUserSession();
  const reset = useResetRecoilState(ProjectMembersContentsAtom);

  const [pageState, setPageState] =
    useRecoilState<ProjectMembersContentsAtomModel>(ProjectMembersContentsAtom);

  const [userList, setUserList] = useState<any>([]);

  const params = useParams();
  const projectId = Number(params?.pid);
  const response = useGetProjectMembers({ id: projectId });
  const { data, refetch } = response;

  const setUserData = () => {
    if (data?.result?.list) {
      setUserList(data?.result?.list ?? []);
    }
  };

  const getData = (userGraphData: Array<GetUserGraphResponseModel>) => {
    let data: Array<GetUserGraphResponseModel> = [];
    if (pageState.membersGraph.date === 'daily') {
      data = userGraphData.map((d) => {
        const date = `20${d.date.substring(0, 2)}-${d.date.substring(
          2,
          4,
        )}-${d.date.substring(4)}`;
        return {
          ...d,
          date,
        };
      });
    } else {
      data = userGraphData.map((d) => {
        const date = `20${d.date.substring(0, 2)}-${d.date.substring(2, 4)}`;
        return {
          ...d,
          date,
        };
      });
    }

    const graphData: MultiBarLineChartType = {
      category: {
        dataKey: 'date',
      },
      bar1: {
        name: t(`page.projectMembers.submittedLabeling`),
        dataKey: 'submittedLabeling',
      },
      bar2: {
        name: t(`page.projectMembers.approvedReview`),
        dataKey: 'approvedReview',
      },
      line: {
        name: t(`page.projectMembers.issued`),
        dataKey: 'issued',
      },
      data,
    };
    const newPageState = _.cloneDeep(pageState);
    newPageState.membersGraph.graphData = graphData;

    setPageState(newPageState);
  };

  useGetUserGraph(
    {
      projectId,
      type: pageState.membersGraph.date === 'daily' ? 0 : 1,
      id: pageState.selectedId ?? 0,
    },
    { getData },
  );

  useEffect(() => {
    setUserData();
  }, [data]);

  useEffect(() => {
    reset();
  }, []);

  return isAdmin && response.status ? (
    <ProjectMembersContents
      memberList={userList}
      refetch={refetch}
      userName={user ?? ''}
    />
  ) : (
    <></>
  );
};

export default ProjectMembersPage;
