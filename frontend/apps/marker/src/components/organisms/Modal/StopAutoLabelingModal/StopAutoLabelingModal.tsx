import { useParams } from 'react-router-dom';

import { AutoLabelingRunResModel } from '@src/pages/AutoLabelingRunPage/hooks/useFetchAutolabelingList';

import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import { RED502 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import usePostStopAutolabeling, {
  usePostStopAutolabelingReqModel,
} from './hooks/usePostStopAutolabeling';
import StopAutoLabelingModalContent from './StopAutoLabelingModalContent/StopAutoLabelingModalContent';

import styles from './StopAutoLabelingModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  rowData: AutoLabelingRunResModel;
  projectId: number;
  refetch: () => void;
};

const StopAutoLabelingModal = ({ rowData, projectId, refetch }: Props) => {
  const { t } = useT();
  const modal = useModal();
  const stopMutation = usePostStopAutolabeling();

  const onClickSubmit = async () => {
    const pid = Number(projectId);
    if (Number.isNaN(pid)) {
      toast.error('오토 라벨링 중지에 실패하였습니다.');
      return;
    }

    const data: usePostStopAutolabelingReqModel = {
      autolabelId: rowData.id,
      deployment: rowData.deploy,
      projectId: pid,
    };

    const resp = await stopMutation.mutateAsync(data);
    if (resp.status === 1) {
      refetch();
      toast.success('오토 라벨링를 중지하였습니다.');
      handleClose();
    } else {
      toast.error('오토 라벨링 중지에 실패하였습니다.');
    }
  };

  const handleClose = () => {
    modal.close();
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: handleClose,
  };
  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.stop`)}`,
    onClick: onClickSubmit,
    customStyle: { backgroundColor: RED502, border: `1px solid ${RED502}` },
  };
  return (
    <Modal.Container>
      <>
        <Modal.ContentContainer confirm>
          <StopAutoLabelingModalContent />
        </Modal.ContentContainer>
        <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
      </>
    </Modal.Container>
  );
};

export default StopAutoLabelingModal;
