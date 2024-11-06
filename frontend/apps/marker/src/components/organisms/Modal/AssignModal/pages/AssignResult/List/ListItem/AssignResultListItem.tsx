import styles from './AssignResultListItem.module.scss';
import classNames from 'classnames/bind';
import { AssignModalMemberModel } from '@src/stores/components/Modal/AssignModalAtom';
import AssignModalBadge from '../../../Badge/AssignModalBadge';
import { Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);

type AssignResultListItemProps = {
  item: AssignModalMemberModel;
  lastChild: boolean;
};

const AssignResultListItem = ({
  item,
  lastChild,
}: AssignResultListItemProps) => {
  return (
    <div className={cx('result-list-item-container', lastChild && 'last')}>
      <div className={cx('worker', 'column')}>
        <AssignModalBadge type={item.type} />
        <div className={cx('name')}>
          <Sypo type='P2' weight='regular'>
            {item.name}
          </Sypo>
        </div>
      </div>
      <div className={cx('labeling', 'column')}>
        <Sypo type='P2' weight='regular'>
          {item.labelingCnt}
        </Sypo>
      </div>
      <div className={cx('review', 'column')}>
        <Sypo type='P2' weight='regular'>
          {item.reviewCnt}
        </Sypo>
      </div>
      <div className={cx('assign', 'column')}>
        <Sypo type='P2' weight='M'>
          {item.assignCnt.toLocaleString('KR')}
        </Sypo>
      </div>
    </div>
  );
};

export default AssignResultListItem;
