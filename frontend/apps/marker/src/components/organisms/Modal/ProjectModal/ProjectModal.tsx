import { useEffect, useState } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalCtlAtom,
  ProjectModalCtlAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { ClassSettingFunctions } from '../common/Contents/ClassSettingContent/functions/ClassSettingFunctions';
import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import ProjectModalContent from './Content/ProjectModalContent';
import ProjectModalModeSelector from './Content/ProjectModalModeSelector';
import {
  CreateNewProjectRequestModel,
  useCreateNewProject,
} from './hooks/useCreateNewProject';
import { useUploadGuideFile } from './hooks/useUploadGuideFile';
import ModalSteps from './Steps/ModalSteps';

import { CarrotLeftIcon } from '@src/static/images';

type ProjectModalProps = {
  refetch: () => void;
};

const ProjectModal = ({ refetch }: ProjectModalProps) => {
  const {
    userSession: { workspaceId },
  } = useUserSession();

  const [modalCtl, setModalCtl] =
    useRecoilState<ProjectModalCtlAtomModel>(ProjectModalCtlAtom);
  const [modalState] = useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const resetModalState = useResetRecoilState(ProjectModalAtom);
  const resetModalCtl = useResetRecoilState(ProjectModalCtlAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useT();
  const modal = useModal();

  const createProjectMutation = useCreateNewProject();
  const fileUploadMutation = useUploadGuideFile();

  const clearModalState = useResetRecoilState(ProjectModalAtom);
  const clearModalCtlState = useResetRecoilState(ProjectModalCtlAtom);
  const onClickCancel = () => {
    clearModalCtlState();
    clearModalState();
    modal.close();
  };

  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: () => {
      onClickCancel();
    },
  };
  const MODAL_HEADER: Array<string> = [
    `${t(`modal.newProject.setting`)}`,
    `${t(`modal.newProject.addMembers`)}`,
    `${t(`modal.newProject.connectDataset`)}`,
    `${t(`modal.newProject.createClasses`)}`,
  ];

  const createProject = async () => {
    const data = bindCreateData();

    setLoading(true);
    const resp = await createProjectMutation.mutateAsync(data);
    // 가이드파일이 있는 경우
    if (resp.result.project_id && modalState.default.guideLine.length > 0) {
      const form = new FormData();

      form.append('projectId', `${resp.result.project_id}`);
      modalState.default.guideLine.forEach((v, idx) => {
        form.append('guide', modalState.default.guideLine[idx]);
      });

      const fileResp = await fileUploadMutation.mutateAsync(form);
      if (fileResp.status === 1) {
        toast.api.post(t(`component.lnb.project`));
      } else {
        toast.api.failed();
      }
      refetch();
      onClickCancel();
    } else {
      // 가이드파일이 없는 경우
      if (resp.result.project_id) {
        toast.api.post(t(`component.lnb.project`));
        refetch();
        onClickCancel();
      } else {
        toast.api.failed();
      }
    }
    setLoading(false);
  };

  const checkValidation = (): boolean => {
    let result = true;

    if (modalCtl.step === 0) {
      if (!modalState.default.title) result = false;
      if (!modalState.default.titleValid) result = false;
      if (modalState.default.tools.length === 0) result = false;
      if (modalState.default.dataType === -1) result = false;
    }
    if (
      ClassSettingFunctions.checkDuplicated(modalState.class.list) &&
      modalCtl.step === 3
    )
      result = false;
    return result;
  };

  const onClickPrev = () => {
    const temp = _.cloneDeep(modalCtl);
    if (modalCtl.step === 0) {
      temp.mode = 0;
    }
    if (modalCtl.step > 0) {
      temp.step--;
    }
    setModalCtl(temp);
  };

  const submitBtn: FooterBtnType = {
    title: `${
      modalCtl.step === 3
        ? `${t(`component.btn.create`)}`
        : `${t(`component.btn.next`)}`
    }`,
    onClick: async () => {
      if (modalCtl.step === 3) {
        createProject();
      } else {
        const temp = _.cloneDeep(modalCtl);
        temp.step++;
        setModalCtl(temp);
      }
    },
    disabled: !checkValidation(),
    loading,
  };

  const handleChangeMode = () => {
    if (!modalCtl.mode) {
      resetModalCtl();
      resetModalState();
    }
  };

  const bindCreateData = () => {
    // bind worker
    const worker: Array<number> = [];

    modalState.invite.memberList.selectedList.forEach((v) => {
      worker.push(v.idx);
    });
    const classes = ClassSettingFunctions.bindRespClassData(
      modalState.class.list,
    );

    const data: CreateNewProjectRequestModel = {
      name: modalState.default.title,
      data: modalState.dataset.selectedPath,
      type: modalState.default.dataType,
      tools: modalState.default.dataType === 1 ? [3] : modalState.default.tools,
      mobile: modalState.default.mobile,
      worker,
      workflow: modalState.default.workStep ? 1 : 0,
      description: modalState.default.desc ?? '',
      workspaceId: Number(workspaceId),
      classes,
    };
    return data;
  };

  useEffect(() => {
    handleChangeMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalCtl.mode]);

  useEffect(() => {
    return () => onClickCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal.Container>
      <Switch>
        <Case condition={modalCtl.mode === 0}>
          <ProjectModalModeSelector />
        </Case>
        <Default>
          <ModalSteps
            onClickCreate={createProject}
            loading={
              createProjectMutation.isLoading || fileUploadMutation.isLoading
            }
          />
          <Modal.Header
            onClickIco={onClickPrev}
            ico={CarrotLeftIcon}
            title={MODAL_HEADER[modalCtl.step]}
          />
          <Modal.ContentContainer scroll={modalCtl.scroll}>
            <ProjectModalContent />
          </Modal.ContentContainer>
          <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
        </Default>
      </Switch>
    </Modal.Container>
  );
};
export default ProjectModal;
