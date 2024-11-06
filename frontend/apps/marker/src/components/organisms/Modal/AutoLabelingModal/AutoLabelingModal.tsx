import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import SetAutoLabelModalAtom, {
  SetAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import Toast from '@src/components/molecules/Toast/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import SetAutoLabelingContent from './content/SetAutoLabelingContent';
import useGetSetAutoLabelData from './hooks/useGetSetAutoLabelData';
import usePostSetAutoLabel from './hooks/usePostSetAutoLabel';

import styles from './AutoLabelingModal.module.scss';
import classNames from 'classnames/bind';
import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';

const cx = classNames.bind(styles);

type Props = {
  projectId: number;
  refetch: () => void;
};
const AutoLabelingModal = ({ projectId, refetch }: Props) => {
  const { t } = useT();
  const modal = useModal();
  const {
    userSession: { workspaceId },
  } = useUserSession();

  const setMutation = usePostSetAutoLabel();
  const reset = useResetRecoilState(SetAutoLabelModalAtom);
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const { data: setData, isLoading } = useGetSetAutoLabelData({
    projectId,
    workspaceId,
  });
  const { data: metaData } = useGetProjectMetaData({ projectId });

  const setAutoLabelData = () => {
    if (setData?.status) {
      const temp = _.cloneDeep(modalState);
      const { autolabelingList, registeredClass } = setData.result;
      temp.autolabelingList = autolabelingList;
      temp.registeredClass = registeredClass;
      temp.isLoading = false;
      if (metaData?.status) {
        temp.projectTools = metaData.result.tools;
      }
      setModalState(temp);
    }
  };

  const handleClose = () => {
    reset();
    modal.close();
  };

  const handleSubmit = async () => {
    const resp = await setMutation.mutateAsync({
      projectId,
      classList: modalState.matchClassList,
    });
    if (resp.status) {
      Toast.success(`${t(`toast.setAutolabeling.success`)}`);
      refetch();
      handleClose();
    } else {
      Toast.error(`${t(`toast.setAutolabeling.failed`)}`);
    }
  };

  const CancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: handleClose,
  };
  const SubmitBtn: FooterBtnType = {
    title: `${t(`component.btn.done`)}`,
    onClick: handleSubmit,
    disabled: modalState.matchClassList.length === 0,
    loading: setMutation.isLoading,
  };
  useEffect(() => {
    setAutoLabelData();
  }, [setData, metaData]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);
  return (
    <Modal.Container>
      <>
        <Modal.Header
          title={`${t(`modal.setAutolabeling.modalTitle`)}`}
          customStyle={{ marginBottom: '24px' }}
        />
        <Modal.ContentContainer>
          <SetAutoLabelingContent />
        </Modal.ContentContainer>
        <Modal.Footer cancelBtn={CancelBtn} submitBtn={SubmitBtn} />
      </>
    </Modal.Container>
  );
};

export type { Props as AutoLabelingModalProps };
export default AutoLabelingModal;
