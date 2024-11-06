import styles from './AssignModalBadge.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);

type Props = {
  // 1 : FB USER 2: LABELER
  type: 1 | 2;
};
const USER_TYPE: Array<string> = ['Labeler', 'JP User'];
const AssignModalBadge = ({ type }: Props) => {
  return (
    <div className={cx('label', type === 1 ? 'lb' : 'fb')}>
      <Sypo type='P4' weight='medium'>
        {USER_TYPE[type - 1]}
      </Sypo>
    </div>
  );
};

export default AssignModalBadge;
