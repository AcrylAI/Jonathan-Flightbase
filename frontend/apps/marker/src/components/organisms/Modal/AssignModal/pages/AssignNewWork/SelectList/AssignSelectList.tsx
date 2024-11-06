import React from 'react';

import { AssignModalMemberModel } from '@src/stores/components/Modal/AssignModalAtom';

import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import AssignSelectListItem from './ListItem/AssignSelectListItem';

import styles from './AssignSelectList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type AssignSelectListProps = {
  list: Array<AssignModalMemberModel>;
  diffSelectedList: Array<AssignModalMemberModel>;
  selectedList: Array<AssignModalMemberModel>;
  onChangeList: (list: Array<AssignModalMemberModel>) => void;
  onChangeSelectedList: (list: Array<AssignModalMemberModel>) => void;
};
const AssignSelectList = ({
  list,
  diffSelectedList,
  selectedList,
  onChangeList,
  onChangeSelectedList,
}: AssignSelectListProps) => {
  const { t } = useT();
  return (
    <div className={cx('select-list-container')}>
      <div className={cx('header')}>
        <div className={cx('no')}>
          <Sypo type='P2'>{t(`modal.assignNewWork.number`)}</Sypo>
        </div>
        <div className={cx('worker')}>
          <Sypo type='P2'>{t(`modal.assignNewWork.worker`)}</Sypo>
        </div>
        <div className={cx('labeling')}>
          <Sypo type='P2'>{t(`modal.assignNewWork.labeling`)}</Sypo>
        </div>
        <div className={cx('review')}>
          <Sypo type='P2'>{t(`modal.assignNewWork.review`)}</Sypo>
        </div>
        <div className={cx('assigned')}>
          <Sypo type='P2'>{t(`modal.assignNewWork.willBeAssigned`)}</Sypo>
        </div>
      </div>
      <div className={cx('list-container')}>
        {selectedList.map((v, idx) => (
          <React.Fragment key={`list-item ${idx}`}>
            <AssignSelectListItem
              idx={idx}
              item={v}
              list={list}
              diffSelectedList={diffSelectedList}
              selectedList={selectedList}
              onChangeList={onChangeList}
              onChangeSelectedList={onChangeSelectedList}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AssignSelectList;
