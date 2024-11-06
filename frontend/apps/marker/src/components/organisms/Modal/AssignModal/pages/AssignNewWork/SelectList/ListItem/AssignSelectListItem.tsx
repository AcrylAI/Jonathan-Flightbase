import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import _ from 'lodash';

import { AssignModalMemberModel } from '@src/stores/components/Modal/AssignModalAtom';

import { Sypo } from '@src/components/atoms';
import AssignModalBadge from '../../../Badge/AssignModalBadge';

import useT from '@src/hooks/Locale/useT';

import {
  CaretDownIcon,
  CaretUpIcon,
  RemoveRedIcon,
  UnFoldIcon,
} from '@src/static/images';

import styles from './AssignSelectListItem.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type AssignSelectListItemProps = {
  idx: number;
  item: AssignModalMemberModel;
  list: Array<AssignModalMemberModel>;
  selectedList: Array<AssignModalMemberModel>;
  diffSelectedList: Array<AssignModalMemberModel>;
  onChangeList: (list: Array<AssignModalMemberModel>) => void;
  onChangeSelectedList: (list: Array<AssignModalMemberModel>) => void;
};

const AssignSelectListItem = ({
  idx,
  item,
  list,
  selectedList,
  diffSelectedList,
  onChangeList,
  onChangeSelectedList,
}: AssignSelectListItemProps) => {
  const { t } = useT();
  const [active, setActive] = useState<boolean>(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const onClickSelectArrow = (e: React.MouseEvent<HTMLDivElement>) => {
    setActive(!active);
  };

  const onClickSelectItem = (
    e: React.MouseEvent<HTMLDivElement>,
    item: AssignModalMemberModel,
  ) => {
    e.stopPropagation();
    // 선택 리스트에 데이터 변경
    if (!handleSelectDisabled(item)) {
      const sTemp = _.cloneDeep(selectedList);
      sTemp[idx] = item;
      onChangeSelectedList(sTemp);
      setActive(false);
    }
  };

  const onClickInputArrow = (kind: 'UP' | 'DOWN') => {
    // 빈 아이템의 기본 인덱스는 -1
    if (item.idx > 0) {
      const temp = _.cloneDeep(selectedList);
      const fIdx = temp.findIndex((v) => v.idx === item.idx);
      if (fIdx !== -1) {
        const count = temp[fIdx].assignCnt;
        if (kind === 'DOWN') {
          if (count > 0) {
            temp[fIdx].assignCnt -= 1;
            onChangeSelectedList(temp);
          }
        } else {
          // UP
          temp[fIdx].assignCnt += 1;
          onChangeSelectedList(temp);
        }
      }
    }
  };

  const onClickRemove = () => {
    const temp = _.cloneDeep(selectedList);
    temp.splice(idx, 1);
    onChangeSelectedList(temp);
  };
  const onChangeAssignCnt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (item.idx > 0) {
      const temp = _.cloneDeep(selectedList);
      const fIdx = temp.findIndex((v) => v.idx === item.idx);
      if (fIdx !== -1) {
        const replaced = e.target.value.replaceAll(',', '');
        const parsed = parseInt(replaced, 10);
        if (Number.isNaN(parsed)) {
          temp[fIdx].assignCnt = 0;
        } else {
          temp[fIdx].assignCnt = parsed;
        }
        onChangeSelectedList(temp);
      }
    }
  };
  const handleSelectDisabled = (item: AssignModalMemberModel): boolean => {
    const fIdx = selectedList.findIndex((v) => v.idx === item.idx);
    const lIdx = diffSelectedList.findIndex((v) => v.idx === item.idx);
    if (fIdx !== -1 || lIdx !== -1) return true;
    return false;
  };

  function handleClickOutside(e: MouseEvent) {
    if (
      (selectRef?.current && !selectRef.current.contains(e.target as Node)) ||
      active
    )
      setActive(false);
  }

  const handleListPos = () => {
    if (selectRef?.current && itemRef?.current && active) {
      const bBox = selectRef.current.getBoundingClientRect();
      itemRef.current.style.width = `434px`;
      itemRef.current.style.position = `fixed`;
      itemRef.current.style.top = `${bBox.y + 50}px `;
      itemRef.current.style.left = `${bBox.x + 434 / 10 + 2}px`;
    }
  };

  useEffect(() => {
    handleListPos();
  }, [active, selectRef?.current, itemRef?.current]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={cx('list-item-container')} ref={selectRef}>
      <div className={cx('no')}>
        <Sypo type='P1'>{(idx + 1).toString().padStart(2, '0')}</Sypo>
      </div>
      <div className={cx('select-item')} onClick={onClickSelectArrow}>
        <div className={cx('worker')}>
          {item.name && <AssignModalBadge type={item.type} />}
          <Sypo type='P1' weight='R'>
            {item.name}
          </Sypo>
        </div>
        <div className={cx('labeling')}>
          <Sypo type='P1'>{item.labelingCnt}</Sypo>
        </div>
        <div className={cx('review')}>
          <Sypo type='P1'>{item.reviewCnt}</Sypo>
        </div>
        <div className={cx('arrow', active && 'active')}>
          <img src={UnFoldIcon} alt='unfold' />
        </div>
        <div
          className={cx('select-list-container', active && 'visible')}
          ref={itemRef}
        >
          <div className={cx('header')}>
            <div className={cx('worker')}>
              <Sypo type='P2'>{t(`page.dashboardProject.projectMembers`)}</Sypo>
            </div>
            <div className={cx('labeling')}>
              <Sypo type='P2'>{t(`modal.assignNewWork.labeling`)}</Sypo>
            </div>
            <div className={cx('review')}>
              <Sypo type='P2'>{t(`modal.assignNewWork.review`)}</Sypo>
            </div>
          </div>
          <div className={cx('list')}>
            {list.map((v, index) => (
              <div
                key={`select-list-item ${index}`}
                onClick={(e) => onClickSelectItem(e, v)}
                className={cx(
                  'select-list-item-container',
                  handleSelectDisabled(v) ? 'dimmed' : 'clear',
                )}
              >
                <div className={cx('worker')}>
                  <AssignModalBadge type={v.type} />
                  <div className={cx('name')}>
                    <Sypo type='P1' weight='R'>
                      {v.name}
                    </Sypo>
                  </div>
                </div>
                <div className={cx('labeling')}>
                  <Sypo type='P1'>{v.labelingCnt}</Sypo>
                </div>
                <div className={cx('review')}>
                  <Sypo type='P1'>{v.reviewCnt}</Sypo>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={cx('assign-input')}>
        <div className={cx('arrow')}>
          <div className={cx('up')} onClick={() => onClickInputArrow('UP')}>
            <img src={CaretUpIcon} alt='up' />
          </div>
          <div className={cx('down')} onClick={() => onClickInputArrow('DOWN')}>
            <img src={CaretDownIcon} alt='down' />
          </div>
        </div>
        <div className={cx('assigned')}>
          <input
            value={
              item.assignCnt === -1 ? '' : item.assignCnt.toLocaleString('kr')
            }
            onChange={onChangeAssignCnt}
          />
        </div>
      </div>
      <div className={cx('delete')} onClick={onClickRemove}>
        <img src={RemoveRedIcon} alt='remove' />
      </div>
    </div>
  );
};

export default AssignSelectListItem;
