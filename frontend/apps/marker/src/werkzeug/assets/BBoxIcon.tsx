import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * Bbox 표시를 위한 아이콘
 */
function BBoxIcon({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 18}
        height={sx || 18}
        viewBox='0 0 18 18'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect
          x='2.59961'
          y='2.60059'
          width='12.8001'
          height='12.8001'
          stroke={color}
        />
        <circle
          r='1.60001'
          transform='matrix(1 0 0 -1 15.3988 2.60018)'
          fill='white'
          stroke={color}
        />
        <circle
          r='1.60001'
          transform='matrix(1 0 0 -1 15.3988 15.4)'
          fill='white'
          stroke={color}
        />
        <circle
          r='1.60001'
          transform='matrix(1 0 0 -1 2.60001 15.4)'
          fill='white'
          stroke={color}
        />
        <circle
          r='1.60001'
          transform='matrix(1 0 0 -1 2.60001 2.60018)'
          fill='white'
          stroke={color}
        />
      </svg>
    </div>
  );
}

export default BBoxIcon;
