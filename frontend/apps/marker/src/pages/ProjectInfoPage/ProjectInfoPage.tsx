import { useParams } from 'react-router-dom';

// API
import useGetProjectInfo from '@src/pages/ProjectInfoPage/hooks/useGetProjectInfo';

// Components
import { ProjectInfoContents } from '@src/components/pageContents';

import useUserSession from '@src/hooks/auth/useUserSession';

const ProjectInfoPage = () => {
  const params = useParams();
  const {
    userSession: { isAdmin, user },
  } = useUserSession();

  const projectId = Number(params?.pid);
  const response = useGetProjectInfo({ id: projectId });
  const { data, refetch } = response;

  return isAdmin && response.status ? (
    <ProjectInfoContents
      infoData={data?.result ?? []}
      datasetData={data?.result.datasetInfo ?? ''}
      guideData={data?.result.guide ?? []}
      projectId={projectId ?? []}
      refetch={refetch ?? []}
      userName={user ?? []}
    />
  ) : (
    <></>
  );
};

export default ProjectInfoPage;
