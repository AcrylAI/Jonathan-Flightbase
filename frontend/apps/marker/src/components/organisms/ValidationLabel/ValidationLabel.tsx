import styles from './ValidationLabel.module.scss';
import classNames from 'classnames/bind';
import { RED502 } from '@src/utils/color';
import { CSSProperties } from 'react';
import { Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);
type ValidationLabelProps = {
  valid: boolean;
  desc: string;
  customLabelStyle?: CSSProperties;
};
const ValidationLabel = ({
  valid,
  desc,
  customLabelStyle,
}: ValidationLabelProps) => {
  return (
    <div className={cx('valid-container')}>
      <div className={cx('ico')}>
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M10.75 6.5L7.08125 10L5.25 8.25'
            stroke={valid ? '#02E366' : RED502}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z'
            stroke={valid ? '#02E366' : RED502}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      <div className={cx('desc')} style={customLabelStyle}>
        <Sypo type='P1' weight='R'>
          {desc}
        </Sypo>
      </div>
    </div>
  );
};
ValidationLabel.defaultProps = {
  customLabelStyle: {},
};

export default ValidationLabel;
