import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * Bbox 도구를 표현하기 위한 아이콘
 */
function ToolBboxIcon({
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
          d='M25.5 9.75H22.5C22.0858 9.75 21.75 10.0858 21.75 10.5V13.5C21.75 13.9142 22.0858 14.25 22.5 14.25H25.5C25.9142 14.25 26.25 13.9142 26.25 13.5V10.5C26.25 10.0858 25.9142 9.75 25.5 9.75Z'
          stroke={color}
          strokeWidth='1.5'
        />
        <path
          d='M13.5 9.75H10.5C10.0858 9.75 9.75 10.0858 9.75 10.5V13.5C9.75 13.9142 10.0858 14.25 10.5 14.25H13.5C13.9142 14.25 14.25 13.9142 14.25 13.5V10.5C14.25 10.0858 13.9142 9.75 13.5 9.75Z'
          stroke={color}
          strokeWidth='1.5'
        />
        <path
          d='M25.5 21.75H22.5C22.0858 21.75 21.75 22.0858 21.75 22.5V25.5C21.75 25.9142 22.0858 26.25 22.5 26.25H25.5C25.9142 26.25 26.25 25.9142 26.25 25.5V22.5C26.25 22.0858 25.9142 21.75 25.5 21.75Z'
          stroke={color}
          strokeWidth='1.5'
        />
        <path
          d='M13.5 21.75H10.5C10.0858 21.75 9.75 22.0858 9.75 22.5V25.5C9.75 25.9142 10.0858 26.25 10.5 26.25H13.5C13.9142 26.25 14.25 25.9142 14.25 25.5V22.5C14.25 22.0858 13.9142 21.75 13.5 21.75Z'
          stroke={color}
          strokeWidth='1.5'
        />
        <path d='M12 21.75V14.25' stroke={color} strokeWidth='1.5' />
        <path d='M21.75 24H14.25' stroke={color} strokeWidth='1.5' />
        <path d='M24 14.25V21.75' stroke={color} strokeWidth='1.5' />
        <path d='M14.25 12H21.75' stroke={color} strokeWidth='1.5' />
      </svg>
    </div>
  );
}

export default ToolBboxIcon;
