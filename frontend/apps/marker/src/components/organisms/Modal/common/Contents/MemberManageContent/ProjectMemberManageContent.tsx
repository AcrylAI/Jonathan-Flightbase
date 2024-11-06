import styles from './ProjectMemberManageContent.module.scss';
import classNames from 'classnames/bind';
import ProjectMemberList from './UserList/ProjectMemberList';
import ProjectMemberSelectedList from './SelectedList/ProjectMemberSelectedList';
import { Sypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';
import { InputText } from '@jonathan/ui-react';
import { SearchIcon } from '@src/static/images';
import React, { useState } from 'react';

const cx = classNames.bind(styles);
export type ProjectMemberManageUserType = {
  id: string;
  idx: number;
  permission: number;
  joinProjectNum: number;
  managingProjectNum: number;
};
export interface ProjectMemberManageContent {
  selectedList: Array<ProjectMemberManageUserType>;
  userList: Array<ProjectMemberManageUserType>;
}

export interface ProjectMemberManageContentProps
  extends ProjectMemberManageContent {
  onClickIcon: (selectedList: Array<ProjectMemberManageUserType>) => void;
}
const ProjectMemberManageContent = ({
  selectedList,
  userList,
  onClickIcon,
}: ProjectMemberManageContentProps) => {
  const { t } = useT();
  const [search, setSearch] = useState<string>('');

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);
  const handleIcon = (user: ProjectMemberManageUserType) => {
    const sl = [...selectedList];
    const fIdx = sl.findIndex((v) => v.idx === user.idx);
    if (fIdx === -1) {
      sl.push(user);
    } else {
      sl.splice(fIdx, 1);
    }
    onClickIcon(sl);
  };
  const handleRemove = (idx: number) => {
    const sl = [...selectedList];
    const fIdx = sl.findIndex((v) => v.idx === idx);
    if (fIdx !== -1) {
      sl.splice(fIdx, 1);
      onClickIcon(sl);
    }
  };
  return (
    <div className={cx('project-member-manage-container')}>
      <div className={cx('desc')}>
        <div className={cx('left-side')}>
          <div className={cx('selected-count')}>
            <Sypo type='H4' weight='bold'>
              <span className={cx('count')}>{selectedList.length}</span>
            </Sypo>
            <Sypo type='H4' weight='medium'>
              {t(`modal.newProject.textSelectedMembers`)}{' '}
            </Sypo>
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('search')}>
            <InputText
              autoFocus
              leftIcon={SearchIcon}
              onChange={onChangeSearch}
              disableLeftIcon={false}
              placeholder={`${t(`component.inputBox.id`)}`}
              customStyle={{
                width: '220px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            />
          </div>
        </div>
      </div>
      <div className={cx('selected-list-wrapper')}>
        <ProjectMemberSelectedList
          onClickIcon={handleRemove}
          selectedList={selectedList}
        />
      </div>
      <div className={cx('member-list-wrapper')}>
        <ProjectMemberList
          search={search}
          selectedList={selectedList}
          userList={userList}
          onClickIcon={handleIcon}
        />
      </div>
    </div>
  );
};

export default ProjectMemberManageContent;
