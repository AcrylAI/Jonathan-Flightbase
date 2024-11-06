import styles from './LoadingPage.module.scss';
import classNames from 'classnames/bind';
import SwapLoading from '@src/components/atoms/Loader/SwapBox/SwapLoading';

const cx = classNames.bind(styles);

const LoadingPage = () => {
  return (
    <div className={cx('loading-container')}>
      <SwapLoading type='group' width={200} height={200} />
    </div>
  );
};

export default LoadingPage;
