import styles from './AssignResult.module.scss';
import classNames from 'classnames/bind';
import AssignResultList from './List/AssignResultList';
import { useRecoilState } from 'recoil';
import {
  AssignModalAtom,
  AssignModalAtomModel,
} from '@src/stores/components/Modal/AssignModalAtom';

const cx = classNames.bind(styles);

const AssignResult = () => {
  const [modalState, setModalState] =
    useRecoilState<AssignModalAtomModel>(AssignModalAtom);
  return (
    <div className={cx('assign-result-container')}>
      <AssignResultList
        title='labeling'
        list={modalState.selectedLabelerList}
      />
      {modalState.hasReview && (
        <AssignResultList
          title='review'
          list={modalState.selectedReviewerList}
        />
      )}
    </div>
  );
};

export default AssignResult;
