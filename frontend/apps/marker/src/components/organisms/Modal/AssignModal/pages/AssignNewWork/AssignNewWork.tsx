import { useState } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  AssignModalAtom,
  AssignModalAtomModel,
  AssignModalMemberModel,
} from '@src/stores/components/Modal/AssignModalAtom';

import useT from '@src/hooks/Locale/useT';

import AssignNewWorkContainer, {
  AssignNewWorkContainerProps,
} from './Container/AssignNewWorkContainer';
import AssignSelectList from './SelectList/AssignSelectList';

import styles from './AssignNewWork.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '@src/components/atoms';
import { RED502 } from '@src/utils/color';

const cx = classNames.bind(styles);

const AssignNewWork = () => {
  const [modalState, setModalState] =
    useRecoilState<AssignModalAtomModel>(AssignModalAtom);
  const { t } = useT();
  const [tab, setTab] = useState<number>(0);
  const onChangeLabelList = (list: Array<AssignModalMemberModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.labelerList = list;
    setModalState(temp);
  };
  const onChangeReviewList = (list: Array<AssignModalMemberModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.reviewerList = list;
    setModalState(temp);
  };
  const onChangeSelectedLabelList = (list: Array<AssignModalMemberModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.selectedLabelerList = list;
    setModalState(temp);
  };
  const onChangeSelectedReviewList = (list: Array<AssignModalMemberModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.selectedReviewerList = list;
    setModalState(temp);
  };

  const handleClickAdd = () => {
    const temp = _.cloneDeep(modalState);
    const nonSelectedList = getNonSelectedList();
    if (nonSelectedList.length > 0) {
      if (tab === 0) {
        temp.selectedLabelerList.push(nonSelectedList[0]);
      } else {
        temp.selectedReviewerList.push(nonSelectedList[0]);
      }
    }
    setModalState(temp);
  };
  const calcAutoDist = (
    list: Array<AssignModalMemberModel>,
    den: number,
    num: number,
  ): Array<AssignModalMemberModel> => {
    if (list.length > 0) {
      const result: Array<AssignModalMemberModel> = [...list];
      // 몫
      const quo = Math.floor(num / den);
      // 나눈 양이 0보다 작을 경우
      if (quo < 0) {
        result[0].assignCnt = den;
        return result;
      }
      // 나머지
      const remain = num % den;
      for (let i = 0; i < result.length; i++) {
        result[i].assignCnt = quo;
      }
      // 나머지를 개인에게 공정 분배
      for (let i = 0; i < remain; i++) {
        if (remain > 0) {
          result[i].assignCnt += 1;
        } else {
          break;
        }
      }

      return result;
    }
    return [];
  };

  const handleAutoDist = (kind: 'label' | 'review') => {
    // 셀렉트 되지않은 셀렉트 박스 제거
    const temp = _.cloneDeep(modalState);
    if (kind === 'label') {
      const filteredList = temp.selectedLabelerList.filter((v) => v.idx !== -1);
      const den = filteredList.length;
      const num = temp.maxLabelCnt;
      const list = calcAutoDist(filteredList, den, num);
      temp.selectedLabelerList = list;
    } else {
      const filteredList = temp.selectedReviewerList.filter(
        (v) => v.idx !== -1,
      );
      const den = filteredList.length;
      const num = temp.maxReviewCnt;
      const list = calcAutoDist(filteredList, den, num);
      temp.selectedReviewerList = list;
    }

    setModalState(temp);
  };

  const calcCurrentDist = (list: Array<AssignModalMemberModel>): number => {
    let result = 0;
    list.forEach((v) => {
      result += v.assignCnt;
    });

    return result;
  };
  const getNonSelectedList = () => {
    const result = modalState.labelerList.filter((v) => {
      const lIdx = modalState.selectedLabelerList.findIndex(
        (fv) => fv.idx === v.idx,
      );
      const rIdx = modalState.selectedReviewerList.findIndex(
        (rv) => rv.idx === v.idx,
      );
      return lIdx === -1 && rIdx === -1;
    });
    return result;
  };
  const addValidation = (): boolean => {
    let result = false;
    const nonSelectedList = getNonSelectedList();
    result =
      modalState.labelerList.length !== 0 && nonSelectedList.length !== 0;
    return result;
  };
  const onChangeTab = (tab: number) => {
    setTab(tab);
  };

  const LabelContainerData: AssignNewWorkContainerProps = {
    tab,
    title: `${t(`modal.assignNewWork.labeling`)}`,
    hasReview: modalState.hasReview,
    distCnt: calcCurrentDist(modalState.selectedLabelerList),
    labelerCnt: modalState.selectedLabelerList.length,
    reviewerCnt: modalState.selectedReviewerList.length,
    maxDistCnt: modalState.maxLabelCnt,
    addBtnTitle: `${t(`component.btn.addWorker`)}`,
    onChangeTab,
    onClickAdd: handleClickAdd,
    onClickAutoDist: () => {
      handleAutoDist('label');
    },
    disableAdd: !addValidation(),
  };
  const ReviewContainerData: AssignNewWorkContainerProps = {
    tab,
    title: `${t(`modal.assignNewWork.review`)}`,
    hasReview: modalState.hasReview,
    distCnt: calcCurrentDist(modalState.selectedReviewerList),
    labelerCnt: modalState.selectedLabelerList.length,
    reviewerCnt: modalState.selectedReviewerList.length,
    maxDistCnt: modalState.maxReviewCnt,
    addBtnTitle: `${t(`component.btn.addReviewer`)}`,
    onChangeTab,
    onClickAdd: handleClickAdd,
    onClickAutoDist: () => {
      handleAutoDist('review');
    },
    disableAdd: !addValidation(),
  };

  return (
    <div className={cx('new-work-container')}>
      <AssignNewWorkContainer
        {...(tab === 0 ? LabelContainerData : ReviewContainerData)}
      >
        <Switch>
          <Case condition={tab === 0}>
            <AssignSelectList
              list={modalState.labelerList}
              selectedList={modalState.selectedLabelerList}
              diffSelectedList={modalState.selectedReviewerList}
              onChangeList={onChangeLabelList}
              onChangeSelectedList={onChangeSelectedLabelList}
            />
          </Case>
          <Case condition={tab === 1}>
            <AssignSelectList
              list={modalState.reviewerList}
              selectedList={modalState.selectedReviewerList}
              diffSelectedList={modalState.selectedLabelerList}
              onChangeList={onChangeReviewList}
              onChangeSelectedList={onChangeSelectedReviewList}
            />
          </Case>
        </Switch>
      </AssignNewWorkContainer>
      <div
        className={cx(
          'reviewer-warning',
          modalState.hasReview &&
            modalState.selectedLabelerList.length > 0 &&
            modalState.selectedReviewerList.length === 0 &&
            'visible',
        )}
      >
        <Sypo type='P1' color={RED502} weight='R'>
          {t(`modal.assignNewWork.reviewerAlert`)}
        </Sypo>
      </div>
    </div>
  );
};

export default AssignNewWork;
