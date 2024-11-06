import styles from './ProjectMemberSelectedList.module.scss';
import classNames from 'classnames/bind';
import { ProjectMemberManageUserType } from '../ProjectMemberManageContent';
import { Typo } from '@src/components/atoms';
import { RemoveBlueIcon } from '@src/static/images';

const cx = classNames.bind(styles);

type ProjectMemberSelectedListProps = {
  selectedList: Array<ProjectMemberManageUserType>;
  onClickIcon: (idx: number) => void;
};
const ProjectMemberSelectedList = ({
  selectedList,
  onClickIcon,
}: ProjectMemberSelectedListProps) => {
  const handleIcon = (idx: number) => {
    onClickIcon(idx);
  };
  return (
    <div className={cx('project-selected-list-container')}>
      {selectedList.map((user, idx) => (
        <div
          key={`list-container ${user.idx} ${idx}`}
          className={cx('list-container')}
        >
          <Typo type='P2' weight='regular'>
            <div className={cx('id')}>{user.id}</div>
          </Typo>
          <div className={cx('icon')} onClick={() => handleIcon(user.idx)}>
            <img src={RemoveBlueIcon} alt='remove' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectMemberSelectedList;
