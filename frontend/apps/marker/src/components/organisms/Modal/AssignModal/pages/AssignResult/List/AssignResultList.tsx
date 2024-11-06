import styles from './AssignResultList.module.scss';
import classNames from 'classnames/bind';
import { AssignModalMemberModel } from '@src/stores/components/Modal/AssignModalAtom';
import React from 'react';
import AssignResultListItem from './ListItem/AssignResultListItem';
import { Sypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type AssignResultListProps = {
  list: Array<AssignModalMemberModel>;
  title: 'labeling' | 'review';
};

const AssignResultList = ({ list, title }: AssignResultListProps) => {
  const { t } = useT();
  return (
    <div className={cx('result-list-wrapper')}>
      <div className={cx('list-total')}>
        <Sypo type='H4' weight='M'>
          {title === 'labeling'
            ? `${t(`modal.confirmAssign.labelingWork`)}`
            : `${t(`modal.confirmAssign.reviewWork`)}`}
          : {list.length}
        </Sypo>
      </div>
      <div className={cx('assign-result-list-container')}>
        <div className={cx('header')}>
          <div className={cx('column', 'worker')}>
            <Sypo type='P2' weight='M'>
              {t(`modal.assignNewWork.worker`)}
            </Sypo>
          </div>
          <div className={cx('column', 'labeling')}>
            <Sypo type='P2' weight='M'>
              {t(`modal.confirmAssign.labelingInProgress`)}
            </Sypo>
          </div>
          <div className={cx('column', 'review')}>
            <Sypo type='P2' weight='M'>
              {t(`modal.confirmAssign.reviewInProgress`)}
            </Sypo>
          </div>
          <div className={cx('column', 'assign')}>
            <Sypo type='P2' weight='M'>
              {t(`modal.confirmAssign.willBeAssigned`)}
            </Sypo>
          </div>
        </div>
        <div className={cx('list-wrapper')}>
          {list.map((v, idx) => (
            <React.Fragment key={`assign-result-list-item ${idx}`}>
              <AssignResultListItem
                item={v}
                lastChild={idx === list.length - 1}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignResultList;
