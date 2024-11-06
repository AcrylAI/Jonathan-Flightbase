import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Switch } from '@jonathan/react-utils';

import {
  AssignModalAtom,
  AssignModalAtomModel,
  AssignModalMemberModel,
} from '@src/stores/components/Modal/AssignModalAtom';

import { Sypo } from '@src/components/atoms';
import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import {
  useGetAssignMember,
  useGetAssignMemberModel,
} from './hooks/useGetAssignMember';
import {
  usePostAssignJob,
  usePostAssignJobMemberModel,
  usePostAssignJobRequestModel,
} from './hooks/usePostAssignJob';
import AssignNewWork from './pages/AssignNewWork/AssignNewWork';
import AssignResult from './pages/AssignResult/AssignResult';

import styles from './AssignModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type AssignModalProps = {
  callAPI: () => void;
  deleteTableRowSelect: () => void;
  tablePageToDefault: React.Dispatch<React.SetStateAction<boolean>>;
};

const AssignModal = ({
  callAPI,
  deleteTableRowSelect,
  tablePageToDefault,
}: AssignModalProps) => {
  const { t } = useT();
  const modal = useModal();
  const [step, setStep] = useState<number>(0);
  const assignMutation = usePostAssignJob();
  const [modalState, setModalState] =
    useRecoilState<AssignModalAtomModel>(AssignModalAtom);
  const { data, isLoading } = useGetAssignMember({
    projectId: modalState.projectId,
  });
  const resetAtom = useResetRecoilState(AssignModalAtom);

  const AssignModalHeader: Array<string> = [
    `${t(`component.btn.assignNewWork`)}`,
    `${t(`modal.confirmAssign.assignedWork`, {
      count: `${modalState.maxLabelCnt.toLocaleString('kr')}`,
    })}`,
  ];

  const checkProjectMemberList = () => {
    if (!isLoading) {
      if (data?.result?.list !== undefined && data?.result?.list !== null) {
        if (data.result.list.length === 0) {
          toast.error(`${t(`modal.addMembers.noMembers`)}`);
        } else {
          const temp = _.cloneDeep(modalState);
          const list = bindMemberData(data.result.list ?? []);

          temp.labelerList = list;
          temp.reviewerList = list;
          setModalState(temp);
        }
      } else {
        modal.close();
      }
    }
  };

  const bindMemberData = (list: Array<useGetAssignMemberModel>) => {
    const result: Array<AssignModalMemberModel> = [];
    list.forEach((v) => {
      const data: AssignModalMemberModel = {
        idx: v.id,
        name: v.name,
        type: v.type,
        labelingCnt: v.labeling,
        reviewCnt: v.review,
        isAssigned: false,
        assignCnt: 0,
      };
      result.push(data);
    });
    return result;
  };

  const bindAssignData = (): usePostAssignJobRequestModel => {
    const {
      filter,
      projectId,
      flag,
      assignId,
      notAssignId,
      selectedLabelerList,
      selectedReviewerList,
    } = modalState;

    const labeling: Array<usePostAssignJobMemberModel> = [];
    const review: Array<usePostAssignJobMemberModel> = [];

    selectedLabelerList.forEach((v) => {
      const data: usePostAssignJobMemberModel = {
        id: v.idx,
        count: v.assignCnt,
      };
      labeling.push(data);
    });
    selectedReviewerList.forEach((v) => {
      const data: usePostAssignJobMemberModel = {
        id: v.idx,
        count: v.assignCnt,
      };
      review.push(data);
    });

    const data: usePostAssignJobRequestModel = {
      filter,
      projectId,
      flag,
      assignId,
      notAssignId,
      labeling,
      review,
    };
    return data;
  };

  const calcCurrentDist = (list: Array<AssignModalMemberModel>): number => {
    let result = 0;
    list.forEach((v) => {
      result += v.assignCnt;
    });

    return result;
  };

  const handleClose = () => {
    resetAtom();
    modal.close();
  };

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      // API Call
      const data = bindAssignData();
      const resp = await assignMutation.mutateAsync(data);
      if (resp.status === 1) {
        toast.success(`${t(`toast.assignModal.assignSuccess`)}`);
        callAPI();
        deleteTableRowSelect();
        tablePageToDefault(true);
        handleClose();
      } else {
        toast.api.failed();
      }
    }
  };

  const onClickCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (step === 0) {
      handleClose();
    } else {
      setStep(step - 1);
    }
  };

  const checkValidation = (): boolean => {
    const labelCnt = calcCurrentDist(modalState.selectedLabelerList);
    const reviewCnt = calcCurrentDist(modalState.selectedReviewerList);
    const labelValidation = labelCnt === modalState.maxLabelCnt;
    const reviewValidation = reviewCnt === modalState.maxReviewCnt;
    if (modalState.hasReview) return labelValidation && reviewValidation;
    return labelValidation;
  };

  const submitBtn: FooterBtnType = {
    title:
      step === 0
        ? `${t(`component.btn.assign`)}`
        : `${t(`component.btn.confirm`)}`,
    disabled: !checkValidation(),
    onClick: onClickSubmit,
    loading: assignMutation.isLoading,
  };
  const cancelBtn: FooterBtnType = {
    title:
      step === 0
        ? `${t(`component.btn.cancel`)}`
        : `${t(`component.btn.goBackwards`)}`,
    onClick: onClickCancel,
  };

  useEffect(() => {
    checkProjectMemberList();
  }, [data]);

  useEffect(() => {
    return () => handleClose();
  }, []);
  return (
    <Modal.Container>
      <>
        <Modal.Header
          title={AssignModalHeader[step]}
          customStyle={{
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <Sypo type='P1' weight='M' color={MONO205}>
              {t(`modal.assignNewWork.notAssignedWorker`)} :{' '}
            </Sypo>
            <Sypo type='P1' weight='B' color={MONO205}>
              {(
                modalState.labelerList.length -
                (modalState.selectedLabelerList.length +
                  modalState.selectedReviewerList.length)
              ).toLocaleString('kr')}
            </Sypo>
          </div>
        </Modal.Header>
        <Switch>
          <Case condition={step === 0}>
            <Modal.ContentContainer>
              <AssignNewWork />
            </Modal.ContentContainer>
          </Case>
          <Case condition={step === 1}>
            <Modal.ContentContainer confirm>
              <AssignResult />
            </Modal.ContentContainer>
          </Case>
        </Switch>
        <Modal.Footer submitBtn={submitBtn} cancelBtn={cancelBtn} />
      </>
    </Modal.Container>
  );
};

export default AssignModal;
