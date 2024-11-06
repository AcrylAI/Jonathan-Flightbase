import { useParams } from 'react-router-dom';

import useGetProjectInfo from '@src/pages/ProjectInfoPage/hooks/useGetProjectInfo';

import { PageHeader } from '@src/components/molecules';

import { MemberProgressBox, MembersListBox } from '@src/components/organisms';
import AddProjectMemberModal from '@src/components/organisms/Modal/AddProjectMemberModal/AddProjectMemberModal';
import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './ProjectMembersContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export type MemberInfoTypes = {
  id: number;
  name: string;
  labeling: number;
  review: number;
};

export type Props = {
  memberList: Array<MemberInfoTypes>;
  refetch: () => void;
  userName: string;
};

const ProjectMembersContents = ({ memberList, refetch, userName }: Props) => {
  const { t } = useT();
  const projectId = Number(useParams().pid);
  const modal = useModal();
  const { data: metaData } = useGetProjectMetaData({ projectId });
  const response = useGetProjectInfo({ id: projectId });
  const { data: projectData } = response;
  const ownerName = projectData?.result.owner ?? '';
  const noReviewProject = projectData?.result.workflow === 0;

  const createModal = () => {
    modal.createModal({
      title: 'create member',
      fullscreen: true,
      content: (
        <AddProjectMemberModal
          projectId={projectId}
          refetch={() => {
            refetch();
          }}
        />
      ),
    });
  };

  return (
    <>
      <PageHeader
        leftSection='memberCount'
        memberCount={memberList.length}
        rightSection={ownerName === userName && 'button'}
        color='blue'
        buttonText={t(`component.btn.addMembers`)}
        projectTitle
        projectTitleValue={metaData?.result?.name ?? ''}
        onClickAction={createModal}
        pageTitle={t(`page.projectMembers.header`)}
      />
      {metaData?.result?.name === '' ? (
        <></>
      ) : (
        <div className={cx('page-contents-container')}>
          <MembersListBox
            memberList={memberList}
            noReviewProject={noReviewProject}
          />
          <MemberProgressBox noReviewProject={noReviewProject} />
        </div>
      )}
    </>
  );
};

export default ProjectMembersContents;
