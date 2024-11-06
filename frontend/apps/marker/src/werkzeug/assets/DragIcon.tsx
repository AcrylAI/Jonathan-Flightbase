import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 드래그 가능 여부를 표시하기 위한 아이콘
 */
function DragIcon({
  size = 'nx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 12}
        height={sx || 12}
        viewBox='0 0 12 12'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M4.3125 3.375C4.62316 3.375 4.875 3.12316 4.875 2.8125C4.875 2.50184 4.62316 2.25 4.3125 2.25C4.00184 2.25 3.75 2.50184 3.75 2.8125C3.75 3.12316 4.00184 3.375 4.3125 3.375Z'
          fill={color}
        />
        <path
          d='M7.6875 3.375C7.99816 3.375 8.25 3.12316 8.25 2.8125C8.25 2.50184 7.99816 2.25 7.6875 2.25C7.37684 2.25 7.125 2.50184 7.125 2.8125C7.125 3.12316 7.37684 3.375 7.6875 3.375Z'
          fill={color}
        />
        <path
          d='M4.3125 6.5625C4.62316 6.5625 4.875 6.31066 4.875 6C4.875 5.68934 4.62316 5.4375 4.3125 5.4375C4.00184 5.4375 3.75 5.68934 3.75 6C3.75 6.31066 4.00184 6.5625 4.3125 6.5625Z'
          fill={color}
        />
        <path
          d='M7.6875 6.5625C7.99816 6.5625 8.25 6.31066 8.25 6C8.25 5.68934 7.99816 5.4375 7.6875 5.4375C7.37684 5.4375 7.125 5.68934 7.125 6C7.125 6.31066 7.37684 6.5625 7.6875 6.5625Z'
          fill={color}
        />
        <path
          d='M4.3125 9.75C4.62316 9.75 4.875 9.49816 4.875 9.1875C4.875 8.87684 4.62316 8.625 4.3125 8.625C4.00184 8.625 3.75 8.87684 3.75 9.1875C3.75 9.49816 4.00184 9.75 4.3125 9.75Z'
          fill={color}
        />
        <path
          d='M7.6875 9.75C7.99816 9.75 8.25 9.49816 8.25 9.1875C8.25 8.87684 7.99816 8.625 7.6875 8.625C7.37684 8.625 7.125 8.87684 7.125 9.1875C7.125 9.49816 7.37684 9.75 7.6875 9.75Z'
          fill={color}
        />
      </svg>
    </div>
  );
}

export default DragIcon;
