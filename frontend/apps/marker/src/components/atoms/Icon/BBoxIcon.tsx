import classNames from 'classnames/bind';
import styles from './IconBox.module.scss';
import useIconSizing from '@src/components/atoms/Icon/useIconSizing';
import { CommonIconProps } from '@src/components/atoms/Icon/type';
import { BLUE106 } from '@src/utils/color';

const cx = classNames.bind(styles);

/**
 * useIconSizing을 이용한 Guard 없는 Bbox Icon
 * @icon
 * @author Dawson
 * @version 22-09-27
 */
function BBoxIcon({
  size = 'default',
  color = BLUE106,
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
