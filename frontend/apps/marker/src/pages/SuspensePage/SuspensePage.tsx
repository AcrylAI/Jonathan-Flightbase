import styles from './SuspensePage.module.scss';
import classNames from 'classnames/bind';
import SwapLoading from '@src/components/atoms/Loader/SwapBox/SwapLoading';

const cx = classNames.bind(styles);

const SuspensePage = () => {
  return (
    <div className={cx('suspense-container')}>
      <SwapLoading type='group' width={200} height={200} />
    </div>
  );
};

export default SuspensePage;
