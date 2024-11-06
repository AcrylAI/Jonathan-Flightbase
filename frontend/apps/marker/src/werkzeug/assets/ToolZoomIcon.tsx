import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 줌인/줌아웃을 표현하기 위한 아이콘
 */
function ToolZoomIcon({
  size = 'lx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 36}
        height={sx || 36}
        viewBox='0 0 36 36'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M13.875 16.875H19.875'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.875 13.875V19.875'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.875 24.75C21.2242 24.75 24.75 21.2242 24.75 16.875C24.75 12.5258 21.2242 9 16.875 9C12.5258 9 9 12.5258 9 16.875C9 21.2242 12.5258 24.75 16.875 24.75Z'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M22.4434 22.4434L26.9996 26.9996'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}

export default ToolZoomIcon;
