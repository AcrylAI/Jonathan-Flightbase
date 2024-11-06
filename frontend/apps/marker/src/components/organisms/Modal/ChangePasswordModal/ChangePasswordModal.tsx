import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import ChangePasswordContent from './content/ChangePasswordContent';

import styles from './ChangePasswordModal.module.scss';
import classNames from 'classnames/bind';
import usePostLabelerEdit from '../LabelerEditModal/hooks/usePostLabelerEdit';
import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import {
  ChangePassModalAtom,
  ChangePassModalAtomType,
} from '@src/stores/components/Modal/ChangePassModalAtom';
import { toast } from '@src/components/molecules/Toast';
import { encrypt } from '@src/utils/utils';

const cx = classNames.bind(styles);
const TOAST_MESSAGE = {
  success: `비밀번호가 변경되었습니다.`,
  failed: `비밀번호 변경에 실패하였습니다.`,
};

const ChangePasswordModal = () => {
  const { t } = useT();
  const modal = useModal();
  const changePassMutation = usePostLabelerEdit();
  const [modalState, setModalState] =
    useRecoilState<ChangePassModalAtomType>(ChangePassModalAtom);
  const reset = useResetRecoilState(ChangePassModalAtom);
  const onClickSubmit = async () => {
    const res = await changePassMutation.mutateAsync({
      password: encrypt(modalState.password),
    });
    if (res.status) {
      if (res.result) {
        toast.success(TOAST_MESSAGE.success);
        handleClose();
      } else {
        toast.error(TOAST_MESSAGE.failed);
      }
    } else {
      toast.error(TOAST_MESSAGE.failed);
    }
  };
  const onClickCancel = () => {
    handleClose();
  };
  const handleClose = () => {
    modal.close();
  };
  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.apply`)}`,
    onClick: onClickSubmit,
    disabled: !modalState.valid,
    loading: changePassMutation.isLoading,
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: onClickCancel,
  };
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);
  return (
    <Modal.Container>
      <>
        <Modal.Header title={`${t(`component.btn.changePassword`)}`} />
        <Modal.ContentContainer confirm>
          <ChangePasswordContent />
        </Modal.ContentContainer>
        <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
      </>
    </Modal.Container>
  );
};

export default ChangePasswordModal;
