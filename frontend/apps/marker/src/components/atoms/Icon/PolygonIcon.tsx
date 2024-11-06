import classNames from 'classnames/bind';
import styles from './IconBox.module.scss';
import useIconSizing from '@src/components/atoms/Icon/useIconSizing';
import { CommonIconProps } from '@src/components/atoms/Icon/type';
import { BLUE106 } from '@src/utils/color';

const cx = classNames.bind(styles);

/**
 * useIconSizing을 이용한 Guard 없는 Polygon Icon
 * @icon
 * @author Dawson
 * @version 22-09-27
 */
function PolygonIcon({
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
        <path
          d='M2.67969 6.93134L6.23524 15.3209H13.3464L15.3217 2.67896L9 10L2.67969 6.93134Z'
          stroke={color}
          strokeLinejoin='round'
        />
        <circle
          cx='2.6788'
          cy='6.62948'
          r='1.29012'
          fill='white'
          stroke={color}
        />
        <circle
          cx='15.3214'
          cy='2.67904'
          r='1.29012'
          fill='white'
          stroke={color}
        />
        <circle
          cx='9.00106'
          cy='9.79012'
          r='1.29012'
          fill='white'
          stroke={color}
        />
        <circle
          cx='5.83895'
          cy='15.3209'
          r='1.29012'
          fill='white'
          stroke={color}
        />
        <circle
          cx='12.9503'
          cy='15.3209'
          r='1.29012'
          fill='white'
          stroke={color}
        />
      </svg>
    </div>
  );
}

export default PolygonIcon;
