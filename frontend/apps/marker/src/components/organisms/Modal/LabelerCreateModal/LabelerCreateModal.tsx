import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';

import {
  LabelerCreateModalAtom,
  LabelerCreateModalAtomModel,
} from '@src/stores/components/Modal/LabelerCreateModalAtom';

import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import { encrypt } from '@src/utils/utils';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import LabelerCreateContent from './content/LabelerCreateContent';
import usePostCreateLabeler, {
  usePostCreateLabelerRequestModel,
} from './hooks/usePostCreateLabeler';

import styles from './LabelerCreateModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  refetch: () => void;
};

const LabelerCreateModal = ({ refetch }: Props) => {
  const {
    userSession: { workspaceId },
  } = useUserSession();

  const [modalState, setModalState] =
    useRecoilState<LabelerCreateModalAtomModel>(LabelerCreateModalAtom);
  const createMutation = usePostCreateLabeler();
  const reset = useResetRecoilState(LabelerCreateModalAtom);
  const modal = useModal();
  const { t } = useT();

  const handleClose = () => {
    reset();
    refetch();
    modal.close();
  };

  const handleSubmit = async () => {
    const parsedWorkspaceId = Number(workspaceId);
    if (Number.isNaN(parsedWorkspaceId)) {
      toast.api.badRequest();
      handleClose();
      return;
    }

    const encPassword: string = encrypt(modalState.password);
    const data: usePostCreateLabelerRequestModel = {
      workspaceId: parsedWorkspaceId,
      name: modalState.name,
      password: encPassword,
      memo: modalState.memo,
    };
    const resp = await createMutation.mutateAsync(data);
    if (resp.status === 1) {
      toast.success(`${t(`toast.labelerCreateModal.createSuccess`)}`);
      handleClose();
    } else {
      toast.api.failed();
    }
  };
  const submitBtn: FooterBtnType = {
    onClick: handleSubmit,
    disabled: !modalState.valid,
    title: `${t(`component.btn.create`)}`,
    loading: createMutation.isLoading,
  };
  const cancelBtn: FooterBtnType = {
    onClick: handleClose,
    title: `${t(`component.btn.cancel`)}`,
  };

  useEffect(() => {
    return () => handleClose();
  }, []);
  return (
    <Modal.Container>
      <>
        <Modal.Header title={`${t(`modal.createMember.header`)}`} />
        <Modal.ContentContainer>
          <LabelerCreateContent />
        </Modal.ContentContainer>
        <Modal.Footer submitBtn={submitBtn} cancelBtn={cancelBtn} />
      </>
    </Modal.Container>
  );
};

export default LabelerCreateModal;
