import styles from './ListItemSkeleton.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ListItemSkeleton = () => {
  return (
    <div className={cx('skeleton-container')}>
      <div className={cx('left-side')}>
        <div className={cx('content')}></div>
        <div className={cx('content', 'short')}></div>
      </div>
      <div className={cx('right-side')}>
        <div className={cx('content', 'chip')}></div>
      </div>
    </div>
  );
};

export default ListItemSkeleton;
