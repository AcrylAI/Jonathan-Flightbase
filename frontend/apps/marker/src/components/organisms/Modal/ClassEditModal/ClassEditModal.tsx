import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import {
  classEditModalAtom,
  ClassEditModalAtomModel,
} from '@src/stores/components/Modal/ClassEditModalAtom';
import { ProjectModalClassItemModel } from '@src/stores/components/Modal/ProjectModalAtom';
import { ClassContentsClassModel } from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';

import { useGetProjectMetaData } from '../AssignModal/hooks/useGetProjectMetaData';
import ModalContentContainer from '../common/Container/ModalContentContainer';
import ClassSettingContent from '../common/Contents/ClassSettingContent/ClassSettingContent';
import { ClassSettingFunctions } from '../common/Contents/ClassSettingContent/functions/ClassSettingFunctions';
import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import usePutEditClass from './hooks/usePutEditClass';

import styles from './ClassEditModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type ClassEditModalProps = {
  projectId: number;
  classList: Array<ClassContentsClassModel>;
  refetch: () => void;
};

const ClassEditModal = ({
  projectId,
  classList,
  refetch,
}: ClassEditModalProps) => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<ClassEditModalAtomModel>(classEditModalAtom);
  const modal = useModal();
  const editMutation = usePutEditClass();
  const { data } = useGetProjectMetaData({ projectId });

  const setClassList = () => {
    // 모달 데이터 추가
    const bindClassList = ClassSettingFunctions.bindReqClassData(classList);
    const modalTemp = _.cloneDeep(modalState);
    modalTemp.list = bindClassList;
    setModalState(modalTemp);
  };
  const onChangeList = (list: Array<ProjectModalClassItemModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.list = list;
    setModalState(temp);
  };
  const onClickCancel = () => {
    modal.close();
  };

  const onClickApply = async () => {
    const classReqList = ClassSettingFunctions.bindRespClassData(
      modalState.list,
    );
    const resp = await editMutation.mutateAsync({
      class: classReqList,
      projectId,
    });

    if (resp.status === 1) {
      toast.success(`${t(`toast.classEditModal.editSuccess`)}`);
      refetch();
      modal.close();
    } else {
      toast.api.failed();
    }
  };

  const cancelBtn: FooterBtnType = {
    title: `${t(`component.btn.cancel`)}`,
    onClick: onClickCancel,
  };

  const submitBtn: FooterBtnType = {
    title: `${t(`component.btn.apply`)}`,
    onClick: onClickApply,
    disabled: ClassSettingFunctions.checkDuplicated(modalState.list),
    loading: editMutation.isLoading,
  };

  useEffect(() => {
    setClassList();
  }, []);

  return (
    <Modal.Container>
      <>
        <Modal.Header
          title={
            classList.length === 0
              ? `${t(`component.btn.createTool`)}`
              : `${t(`modal.editClasses.editClasses`)}`
          }
        />
        <ModalContentContainer>
          <ClassSettingContent
            edit
            classList={modalState.list}
            toolList={data?.result.tools ?? [1]}
            onChangeClassList={onChangeList}
          />
        </ModalContentContainer>
        <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
      </>
    </Modal.Container>
  );
};

export default ClassEditModal;
