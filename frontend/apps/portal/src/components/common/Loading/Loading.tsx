import React from 'react';
import { useRecoilState } from 'recoil';

// Components
import { loadingStateAtom } from '@src/atom/ui/Loading';

// Style
import styles from './Loading.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const Loading = () => {
  const [loading] = useRecoilState<boolean>(loadingStateAtom);

  if (loading) {
    return (
      <div id='Loader' className={cx('loading-bg')}>
        <div className={cx('spinner')}>
          <div className={cx('double-bounce1')}></div>
          <div className={cx('double-bounce2')}></div>
        </div>
      </div>
    );
  }
  return <></>;
};

export default Loading;
