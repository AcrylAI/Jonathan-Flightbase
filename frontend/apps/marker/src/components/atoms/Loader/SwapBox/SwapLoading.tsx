import { useState } from 'react';
import ls1 from '@src/static/images/loading/LoadingS1.svg';
import ls2 from '@src/static/images/loading/LoadingS2.svg';
import ls3 from '@src/static/images/loading/LoadingS3.svg';
import ll1 from '@src/static/images/loading/LoadingL1.svg';
import ll2 from '@src/static/images/loading/LoadingL2.svg';
import ll3 from '@src/static/images/loading/LoadingL3.svg';

import styles from './SwapLoading.module.scss';
import classNames from 'classnames/bind';
import { useEffect } from 'react';

const cx = classNames.bind(styles);

type Props = {
  type?: 'group' | 'single';
  interval?: number;
  width?: number;
  height?: number;
};

const smallImages = [ls1, ls2, ls3];
const largeImages = [ll1, ll2, ll3];
function SwapLoading({ type, interval, width, height }: Props) {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : 0));
    }, interval);
    return () => clearInterval(tick);
  }, []);
  return (
    <div className={cx('loading-container')}>
      <img
        src={type === 'group' ? largeImages[step] : smallImages[step]}
        alt='loading'
        width={width}
        height={height}
      />
    </div>
  );
}

SwapLoading.defaultProps = {
  type: 'single',
  interval: 500,
  width: 100,
  height: 100,
};
export default SwapLoading;
