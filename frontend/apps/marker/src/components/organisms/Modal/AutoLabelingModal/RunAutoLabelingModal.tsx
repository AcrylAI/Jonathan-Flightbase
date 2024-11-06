import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import RunAutoLabelModalAtom, {
  RunAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/RunAutoLabelModalAtom';

import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import AutoLabelingContent from './content/AutoLabelingContent';
import useGetRunAutoLabel from './hooks/useGetRunAutoLabel';
import usePostAutoLabelRun, {
  usePostAutoLabelRunRequestModel,
} from './hooks/usePostAutoLabelRun';

import styles from './RunAutoLabelingModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  projectId: number;
  refetch: () => void;
};
const RunAutoLabelingModal = ({ projectId, refetch }: Props) => {
  const { t } = useT();
  const modal = useModal();
  const {
    userSession: { workspaceId },
  } = useUserSession();

  const [modalState, setModalState] =
    useRecoilState<RunAutoLabelModalAtomModel>(RunAutoLabelModalAtom);
  const reset = useResetRecoilState(RunAutoLabelModalAtom);

  const { data: runData } = useGetRunAutoLabel({
    projectId,
    workspaceId,
  });
  const runMutation = usePostAutoLabelRun();
  const handleClose = () => {
    modal.close();
  };

  const setRunData = () => {
    if (runData?.status === 1) {
      const temp = _.cloneDeep(modalState);
      const { classList, modelList, keepData, data } = runData.result;
      temp.classList = classList;
      temp.modelList = modelList;
      temp.keepData = keepData;
      temp.data = data;
      temp.dataCnt = modalState.dataType === 0 ? data.unworked : data.overall;
      temp.isLoading = false;
      setModalState(temp);
    }
  };
  const onClickSubmit = async () => {
    const { dataType, keepDataType, dataCnt } = modalState;
    const data: usePostAutoLabelRunRequestModel = {
      projectId,
      dataType,
      keepData: keepDataType,
      dataCnt,
    };
    const resp = await runMutation.mutateAsync(data);
    if (resp.status === 1) {
      toast.success(`${t(`modal.runAutolabeling.startAutolabeling`)}`);
      refetch();
      modal.close();
    } else {
      toast.error(`${t(`modal.runAutolabeling.failedStartAutolabeling`)}`);
    }
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: handleClose,
  };
  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.run`)}`,
    onClick: onClickSubmit,
    loading: runMutation.isLoading,
    disabled:
      modalState.isLoading ||
      modalState.dataCnt === 0 ||
      modalState.modelList.length === 0 ||
      modalState.classList.length === 0,
  };
  useEffect(() => {
    setRunData();
    return () => {
      reset();
    };
  }, [runData]);
  return (
    <Modal.Container>
      <>
        <Modal.Header title={`${t(`modal.runAutolabeling.modalTitle`)}`} />
        <Modal.ContentContainer>
          <AutoLabelingContent />
        </Modal.ContentContainer>
        <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
      </>
    </Modal.Container>
  );
};

export default RunAutoLabelingModal;
