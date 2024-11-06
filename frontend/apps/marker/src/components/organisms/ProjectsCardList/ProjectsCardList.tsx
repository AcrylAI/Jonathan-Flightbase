import { useNavigate } from 'react-router-dom';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  NewProjectCard,
  ProjectCard,
  SkeletonCard,
} from '@src/components/molecules';

import useUserSession from '@src/hooks/auth/useUserSession';

import style from './ProjectsCardList.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type ProjectInfoType = {
  notAssigned: number;
  assigned: number;
  complete: number;
};

type WorkInfoType = {
  labeling: number;
  review: number;
  rejected: number;
  reddot: number;
};

type Props = {
  projectData: Array<ProjectInfoTypes>;
  onInnerTabClick: (
    idx: number,
    selected: 'project' | 'work' | 'description',
  ) => void;
  selectInnerContent: Array<'project' | 'work' | 'description'>;
  refetch: () => void;
  isLoading: boolean;
};

export type InnerInfoTypes = {
  projectInfo: ProjectInfoType;
  workInfo: WorkInfoType;
};

export type ProjectInfoTypes = {
  working: number;
  workflow: number;
  type: string;
  tools: Array<string>;
  projectTitle: string;
  ownerName: string;
  ownerId: number;
  mobile: number;
  innerInfo: {
    projectInfo: ProjectInfoType;
    workInfo: WorkInfoType;
  };
  id: number;
  bookmark: number;
  selectInnerContent: Array<'project' | 'work' | 'description'>;
  description: string;
  autolabeling: 0 | 1;
};

const ProjectsCardList = ({
  projectData,
  onInnerTabClick,
  selectInnerContent,
  refetch,
  isLoading,
}: Props) => {
  const navigate = useNavigate();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  // 카드 클릭 시 navigate 시키는 onClick 함수
  const onCardClick = (projectId: number) => {
    if (isAdmin) {
      navigate(`/admin/projects/${projectId}/dashboard/project`);
    } else {
      navigate(`/user/projects/${projectId}/dashboard/mywork`);
    }
  };

  return (
    <div className={cx('container')}>
      <div className={cx('container-inner')}>
        {/* JPUser 일시 프로젝트 생성 카드 출력,
        GET 해 온 데이터를 map 함수를 통해 프로젝트 리스트를 출력합니다. */}
        {isAdmin && <NewProjectCard refetch={refetch} />}
        <Switch>
          <Case condition={isLoading}>
            {[0, 1, 2, 3, 4, 5, 6].map((v, idx) => (
              <SkeletonCard key={`project-card-skeleton-${idx}`} />
            ))}
          </Case>
          <Default>
            {projectData.map((data: ProjectInfoTypes, idx: number) => (
              <ProjectCard
                key={`projectCard-${idx}`}
                projectData={data}
                innerData={data.innerInfo}
                idx={idx}
                onCardClick={onCardClick}
                projectId={projectData[idx].id}
                onInnerTabClick={onInnerTabClick}
                selectInnerContent={selectInnerContent}
                refetch={() => {
                  refetch();
                }}
              />
            ))}
          </Default>
        </Switch>
      </div>
    </div>
  );
};

export default ProjectsCardList;
