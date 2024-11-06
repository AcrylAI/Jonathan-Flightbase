import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 프로젝트 명을 표시하기 위한 아이콘
 */
function FoldIcon({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 16}
        height={sx || 16}
        viewBox='0 0 16 16'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M13 6L8 11L3 6'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}

export default FoldIcon;
