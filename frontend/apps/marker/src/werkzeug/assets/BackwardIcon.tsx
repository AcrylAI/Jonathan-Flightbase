import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function BackwardIcon({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 16} height={sx || 16} viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13L5 8L10 3" stroke={ color } strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default BackwardIcon;
