import React, { useState } from 'react';
import { useEffect } from 'react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { Sypo } from '@src/components/atoms';
import { ProjectMemberManageUserType } from '../ProjectMemberManageContent';

import useT from '@src/hooks/Locale/useT';

import styles from './ProjectMemberList.module.scss';
import classNames from 'classnames/bind';
import { MONO205 } from '@src/utils/color';

const cx = classNames.bind(styles);

type ProjectMemberList = {
  search: string;
  userList: Array<ProjectMemberManageUserType>;
  selectedList: Array<ProjectMemberManageUserType>;
  onClickIcon: (user: ProjectMemberManageUserType) => void;
};
type SortOpt = 'memberTypeAsc' | 'memberTypeDesc' | ''; // ACS FB user DESC Labeler

type ListOpt = {
  filteredList: Array<ProjectMemberManageUserType>;
  sortOpt: SortOpt;
};
type CaretProps = {
  active: boolean;
};
type CaretGroupProps = {
  status: SortOpt;
  onClick: () => void;
};
const CaretUp = ({ active }: CaretProps) => {
  return (
    <svg
      width='10'
      height='7'
      viewBox='0 0 10 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9.87075 5.14573L5.32396 0.146539C5.23775 0.0526637 5.12133 0 5 0C4.87867 0 4.76225 0.0526637 4.67604 0.146539L0.129255 5.14573C0.0675736 5.21801 0.0257652 5.30801 0.00866668 5.40533C-0.00843183 5.50265 -0.000121687 5.6033 0.0326359 5.69564C0.0674195 5.78662 0.12592 5.86425 0.200765 5.91874C0.275609 5.97323 0.363449 6.00215 0.453214 6.00184H9.54679C9.63655 6.00215 9.72439 5.97323 9.79924 5.91874C9.87408 5.86425 9.93258 5.78662 9.96736 5.69564C10.0001 5.6033 10.0084 5.50265 9.99133 5.40533C9.97424 5.30801 9.93243 5.21801 9.87075 5.14573Z'
        fill={active ? MONO205 : '#C1C1C1'}
      />
    </svg>
  );
};
const CaretDown = ({ active }: CaretProps) => {
  return (
    <svg
      width='10'
      height='6'
      viewBox='0 0 10 6'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9.96736 0.306203C9.93258 0.215217 9.87408 0.137587 9.79924 0.0830969C9.72439 0.0286065 9.63655 -0.000306301 9.54679 2.44715e-06H0.453214C0.363449 -0.000306301 0.275609 0.0286065 0.200765 0.0830969C0.12592 0.137587 0.0674195 0.215217 0.0326359 0.306203C-0.000121687 0.398543 -0.00843183 0.499194 0.00866668 0.59651C0.0257652 0.693827 0.0675736 0.783832 0.129255 0.856113L4.67604 5.8553C4.76295 5.9477 4.87911 5.99934 5 5.99934C5.12089 5.99934 5.23705 5.9477 5.32396 5.8553L9.87075 0.856113C9.93243 0.783832 9.97424 0.693827 9.99133 0.59651C10.0084 0.499194 10.0001 0.398543 9.96736 0.306203Z'
        fill={active ? MONO205 : '#C1C1C1'}
      />
    </svg>
  );
};

const CaretIcon = ({ status, onClick }: CaretGroupProps) => {
  return (
    <div className={cx('carrot')} onClick={onClick}>
      <div className={cx('up')}>
        <CaretUp active={status === 'memberTypeAsc'} />
      </div>
      <div className={cx('down')}>
        <CaretDown active={status === 'memberTypeDesc'} />
      </div>
    </div>
  );
};

const ProjectMemberList = ({
  search,
  userList,
  selectedList,
  onClickIcon,
}: ProjectMemberList) => {
  const { t } = useT();
  const [listOpt, setListOpt] = useState<ListOpt>({
    filteredList: userList,
    sortOpt: '',
  });
  const checkSelected = (idx: number) => {
    const fIdx = selectedList.findIndex((v) => v.idx === idx);
    return fIdx !== -1;
  };

  const handleIcon = (user: ProjectMemberManageUserType) => {
    onClickIcon(user);
  };

  const handleSelectedList = () => {
    if (userList.length > 0) {
      let result: Array<ProjectMemberManageUserType> = [...userList];
      // id filter
      if (search) {
        result = userList.filter((v) => v.id && v.id.includes(search));
      }
      if (listOpt.sortOpt) {
        result.sort((a, b) => {
          if (listOpt.sortOpt === 'memberTypeAsc') {
            return b.permission - a.permission;
          }
          return a.permission - b.permission;
        });
      }

      setListOpt((prev) => ({ ...prev, filteredList: result }));
    }
  };
  const onChangeUserList = () => {
    setListOpt((prev) => ({ ...prev, filteredList: userList }));
  };
  const onChangeSort = () => {
    const { sortOpt } = listOpt;
    let sort: SortOpt = '';
    switch (sortOpt) {
      case '':
        sort = 'memberTypeAsc';
        break;
      case 'memberTypeAsc':
        sort = 'memberTypeDesc';
        break;
      default: {
        sort = '';
      }
    }
    setListOpt((prev) => ({
      ...prev,
      sortOpt: sort,
    }));
  };
  useEffect(() => {
    onChangeUserList();
  }, [userList]);

  useEffect(() => {
    handleSelectedList();
  }, [search, listOpt.sortOpt, selectedList]);

  return (
    <div className={cx('user-list-container')}>
      <Switch>
        <Case condition={listOpt.filteredList.length === 0}>
          <div className={cx('nodata')}>{t(`modal.addMembers.noMembers`)}</div>
        </Case>
        <Default>
          <div
            key={`user-list-item `}
            className={cx('user-list-item', 'header')}
          >
            <div className={cx('left-side')}>
              <div className={cx('item', 'permission')}>
                <div className={cx('label')} onClick={onChangeSort}>
                  <Sypo type='P2'>{t(`modal.newProject.memberType`)}</Sypo>
                </div>
                <CaretIcon status={listOpt.sortOpt} onClick={onChangeSort} />
              </div>
              <div className={cx('item', 'id')}>
                <Sypo type='P2'>{t(`modal.newProject.id`)}</Sypo>
              </div>
            </div>
            <div className={cx('right-side')}>
              <div className={cx('item', 'join-project-number')}>
                <Sypo type='P2'>
                  {t(`modal.newProject.participatingProject`)}
                </Sypo>
              </div>
              <div className={cx('item', 'managing-project-number')}>
                <Sypo type='P2'>{t(`modal.newProject.monitoringProject`)}</Sypo>
              </div>
              <div className={cx('item', 'control-icon')}></div>
            </div>
          </div>
          <div className={cx('row-wrapper')}>
            {listOpt.filteredList.map((user, idx) => (
              <div
                key={`user-list-item ${idx}`}
                className={cx('user-list-item', 'row')}
              >
                <div className={cx('left-side')}>
                  <div className={cx('item', 'permission')}>
                    <div
                      className={cx(
                        'label',
                        `${user.permission === 2 ? 'flightbase' : 'labeler'}`,
                      )}
                    >
                      <Sypo type='P2'>
                        {user.permission === 2
                          ? `${t(`component.badge.fbUser`)}`
                          : `${t(`component.badge.labeler`)}`}
                      </Sypo>
                    </div>
                  </div>
                  <div className={cx('item', 'id')}>
                    <Sypo type='P1' weight='regular'>
                      {user.id}
                    </Sypo>
                  </div>
                </div>
                <div className={cx('right-side')}>
                  <div className={cx('item', 'join-project-number')}>
                    <Sypo type='P1' weight='regular'>
                      {user.joinProjectNum}
                    </Sypo>
                  </div>
                  <div className={cx('item', 'managing-project-number')}>
                    <Sypo type='P1' weight='regular'>
                      {user.managingProjectNum}
                    </Sypo>
                  </div>
                  <div
                    className={cx('item', 'control-icon')}
                    onClick={() => handleIcon(user)}
                  >
                    <div
                      className={cx(
                        'circle',
                        checkSelected(user.idx) && 'active',
                      )}
                    >
                      <div
                        className={cx(
                          'bar',
                          'x-axis',
                          checkSelected(user.idx) && 'active',
                        )}
                      ></div>
                      <div
                        className={cx(
                          'bar',
                          'y-axis',
                          checkSelected(user.idx) && 'active',
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Default>
      </Switch>
    </div>
  );
};
export default ProjectMemberList;
