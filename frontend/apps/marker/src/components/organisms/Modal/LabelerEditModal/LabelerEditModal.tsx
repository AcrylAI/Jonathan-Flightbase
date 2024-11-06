import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import { LabelerEditModalAtom } from '@src/stores/components/Modal/LabelerEditModalAtom';

import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import { MemberTableColumnType } from '@src/utils/types/data';
import { encrypt } from '@src/utils/utils';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import LabelerEditModalContent from './content/LabelerEditModalContent';
import usePostLabelerEdit, {
  labelerEditRequestModel,
} from './hooks/usePostLabelerEdit';

import styles from './LabelerEditModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  userData: MemberTableColumnType;
  refetch: () => void;
};

const LabelerEditModal = ({ userData, refetch }: Props) => {
  const { t } = useT();
  const modal = useModal();
  const reset = useResetRecoilState(LabelerEditModalAtom);
  const [modalState, setModalState] =
    useRecoilState<LabelerEditModalAtom>(LabelerEditModalAtom);
  const editMutation = usePostLabelerEdit();

  const setUserData = () => {
    const temp = _.cloneDeep(modalState);
    temp.id = userData.id ?? 0;
    temp.name = userData.name ?? '';
    temp.memo = userData.memo ?? '';
    setModalState(temp);
  };

  const closeHandler = () => {
    refetch();
    reset();
    modal.close();
  };

  const onClickSubmit = async () => {
    if (modalState.id !== 0) {
      const data: labelerEditRequestModel = {
        id: modalState.id,
        name: modalState.name,
        password: encrypt(modalState.password),
        memo: modalState.memo,
      };
      const resp = await editMutation.mutateAsync(data);
      if (resp.status === 1) {
        toast.success(`${t(`toast.labelerEditModal.editSuccess`)}`);
        closeHandler();
      } else {
        toast.api.failed();
      }
    } else {
      toast.api.badRequest();
      closeHandler();
    }
  };

  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.save`)}`,
    disabled: !modalState.valid && modalState.passToggle,
    onClick: onClickSubmit,
    loading: editMutation.isLoading,
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: closeHandler,
  };

  useEffect(() => {
    setUserData();
  }, []);

  return (
    <Modal.Container>
      <>
        <Modal.Header title={`${t(`modal.editMember.header`)}`} />
        <Modal.ContentContainer confirm>
          <LabelerEditModalContent />
        </Modal.ContentContainer>
        <Modal.Footer submitBtn={submitBtn} cancelBtn={cancelBtn} />
      </>
    </Modal.Container>
  );
};

export default LabelerEditModal;
