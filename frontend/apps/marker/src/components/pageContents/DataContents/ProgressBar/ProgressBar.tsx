import { Sypo } from '@src/components/atoms';

import { MONO205 } from '@src/utils/color';

import styles from './ProgressBar.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
function ProgressBar(props: any) {
  const { completed } = props;

  return (
    <div className={cx('container')}>
      <Sypo color={MONO205} weight='regular' type='h3'>
        Loading Data...
      </Sypo>
      <div className={cx('progressbarStyle')}>
        <div style={{ width: `${completed}%` }} className={cx('filterStyle')} />
      </div>
    </div>
  );
}

export default ProgressBar;
