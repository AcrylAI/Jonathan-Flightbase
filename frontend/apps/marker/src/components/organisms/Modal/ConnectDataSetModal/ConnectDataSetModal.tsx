import { useEffect } from 'react';
// recoil
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ConnectDataSetModalAtom,
  ConnectDataSetModalAtomModel,
} from '@src/stores/components/Modal/ConnectDataSetModalAtom';

import { useGetProjectMetaData } from '../AssignModal/hooks/useGetProjectMetaData';
import ConnectDataSetContent from '../common/Contents/ConnectDataSetContent/ConnectDataSetContent';
// API
import { useGetDataSetList } from '../common/Contents/ConnectDataSetContent/hooks/useGetDataSetList';
import { FooterBtnType } from '../common/Footer/ModalFooter';
// Modal
import Modal from '../common/Modal';

// Atoms
import { toast } from '@src/components/molecules/Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import {
  usePostLinkDataset,
  usePostLinkDatasetRequestModel,
} from './hooks/usePostLinkDataset';

type Props = {
  refetch: () => void;
  projectId: number;
};
const ConnectDataSetModal = ({ refetch, projectId }: Props) => {
  const reset = useResetRecoilState(ConnectDataSetModalAtom);
  const modal = useModal();
  const { t } = useT();
  const {
    userSession: { workspaceId },
  } = useUserSession();
  const { data: metaData } = useGetProjectMetaData({ projectId });

  const connectMutation = usePostLinkDataset();
  const [modalState, setModalState] =
    useRecoilState<ConnectDataSetModalAtomModel>(ConnectDataSetModalAtom);

  const { data, isLoading } = useGetDataSetList({
    workspaceId,
    type: metaData?.result?.type,
  });

  const onChangeData = (data: ConnectDataSetModalAtomModel) => {
    setModalState(data);
  };

  const setDataSetList = () => {
    if (data && data.status === 1) {
      const temp = _.cloneDeep(modalState);
      temp.list = Array.isArray(data.result) ? data.result : [];
      setModalState(temp);
    }
  };

  const handleClose = () => {
    refetch();
    reset();
    modal.close();
  };

  const handleSubmit = async () => {
    const type = metaData?.result?.type;
    if (type !== null) {
      const data: usePostLinkDatasetRequestModel = {
        projectId,
        path: modalState.selectedPath,
        type,
      };
      const resp = await connectMutation.mutateAsync(data);
      if (resp.status === 1) {
        toast.api.success();
        handleClose();
      } else {
        toast.api.failed();
      }
    } else {
      toast.api.badRequest();
    }
  };

  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.connectBtn`)}`,
    onClick: handleSubmit,
    disabled: !modalState.selectedPath,
    loading: connectMutation.isLoading,
  };
  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: handleClose,
  };

  useEffect(() => {
    setDataSetList();
  }, [data]);

  useEffect(() => {
    return () => reset();
  }, []);

  return (
    <Modal.Container>
      <>
        <Modal.Header title='Connect Dataset' />
        <Modal.ContentContainer>
          <ConnectDataSetContent
            fileCount={modalState.fileCount}
            loading={isLoading}
            data={modalState}
            dataType={metaData?.result?.type ?? 0}
            onChangeData={onChangeData}
          />
        </Modal.ContentContainer>
        <Modal.Footer submitBtn={submitBtn} cancelBtn={cancelBtn} />
      </>
    </Modal.Container>
  );
};

export default ConnectDataSetModal;
