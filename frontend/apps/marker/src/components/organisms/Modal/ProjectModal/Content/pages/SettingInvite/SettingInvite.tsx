import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { toast } from '@src/components/molecules/Toast';

import {
  useGetProjectMemberAddList,
  WorkspaceUserListResponseModel,
} from '@src/components/organisms/Modal/common/Contents/MemberManageContent/hooks/useGetProjectMemberList';
import ProjectMemberManageContent, {
  ProjectMemberManageUserType,
} from '@src/components/organisms/Modal/common/Contents/MemberManageContent/ProjectMemberManageContent';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import styles from './SettingInvite.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const SettingInvite = () => {
  const { t } = useT();
  const {
    userSession: { workspaceId },
  } = useUserSession();

  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);

  const { data, isLoading } = useGetProjectMemberAddList({
    workspaceId: Number(workspaceId),
  });

  const handleSelectedList = (
    selectedList: Array<ProjectMemberManageUserType>,
  ) => {
    const temp = _.cloneDeep(modalState);
    temp.invite.memberList.selectedList = selectedList;
    setModalState(temp);
  };
  const setMemberList = () => {
    const temp = _.cloneDeep(modalState);
    temp.invite.memberList.userList = bindMemberData();
    setModalState(temp);
  };

  const bindMemberData = () => {
    if (!data?.status && !isLoading) {
      toast.api.failed();
    }
    if (data?.result?.list) {
      const temp: Array<ProjectMemberManageUserType> = [];
      data.result.list.forEach((v: WorkspaceUserListResponseModel) => {
        const userData: ProjectMemberManageUserType = {
          id: v.name,
          idx: v.id,
          managingProjectNum: v.manageProject,
          joinProjectNum: v.participateProject,
          permission: v.type,
        };
        temp.push(userData);
      });
      return temp;
    }
    return [];
  };

  useEffect(() => {
    setMemberList();
  }, [data]);

  return (
    <div className={cx('setting-invite-container')}>
      <ProjectMemberManageContent
        {...modalState.invite.memberList}
        onClickIcon={handleSelectedList}
      />
    </div>
  );
};
export default SettingInvite;
