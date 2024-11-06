import { useState } from 'react';
import { useEffect } from 'react';
import _ from 'lodash';

import { WorkspaceUserListResponseModel } from '../common/Contents/MemberManageContent/hooks/useGetProjectMemberList';
import AddMemberContent, {
  ProjectMemberManageContent,
  ProjectMemberManageUserType,
} from '../common/Contents/MemberManageContent/ProjectMemberManageContent';
import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import useGetAddMemberList from './hooks/useGetAddProjectMemberList';
import usePostAddProjectMember, {
  usePostAddProjectMemberRequestModel,
} from './hooks/usePostAddProjectMember';

import styles from './AddProjectMemberModal.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  projectId: number;
  refetch: () => void;
};
const AddProjectMemberModal = ({ projectId, refetch }: Props) => {
  const { t } = useT();
  const { userSession } = useUserSession();

  const [memberList, setMemberList] = useState<ProjectMemberManageContent>({
    selectedList: [],
    userList: [],
  });
  const { data, isLoading } = useGetAddMemberList({
    projectId,
    workspaceId: userSession.workspaceId,
  });
  const addMutation = usePostAddProjectMember();
  const modal = useModal();

  const bindUserData = () => {
    if (!isLoading && data?.status === 0) {
      toast.api.failed();
      return;
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
      setMemberList((prev) => ({ ...prev, userList: temp }));
    }
  };

  const handleSelectedList = (
    selectedList: Array<ProjectMemberManageUserType>,
  ) => {
    const temp = _.cloneDeep(memberList);
    temp.selectedList = selectedList;
    setMemberList(temp);
  };

  const handleSubmit = async () => {
    type userType = {
      id: number;
    };
    const userIndexList: Array<userType> = [];
    memberList.selectedList.forEach((v) => {
      userIndexList.push({ id: v.idx });
    });
    const data: usePostAddProjectMemberRequestModel = {
      projectId,
      users: userIndexList,
    };
    const resp = await addMutation.mutateAsync(data);
    if (resp.status === 1) {
      refetch();
      toast.success(`${t(`toast.addProjectMemberModal.addSuccess`)}`);
      modal.close();
    } else {
      toast.api.failed();
    }
  };
  const handleCancel = () => {
    modal.close();
  };

  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.add`)}`,
    onClick: handleSubmit,
    loading: addMutation.isLoading,
    disabled: memberList.selectedList.length === 0,
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: handleCancel,
  };

  useEffect(() => {
    bindUserData();
  }, [data]);
  return (
    <Modal.Container>
      <>
        <Modal.Header title={`${t(`component.btn.addMembers`)}`} />
        <Modal.ContentContainer>
          <AddMemberContent {...memberList} onClickIcon={handleSelectedList} />
        </Modal.ContentContainer>
        <Modal.Footer submitBtn={submitBtn} cancelBtn={cancelBtn} />
      </>
    </Modal.Container>
  );
};

export default AddProjectMemberModal;
