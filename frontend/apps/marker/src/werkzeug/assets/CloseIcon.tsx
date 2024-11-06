import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 닫기 버튼을 위한 아이콘
 */
function CloseIcon({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx||16 } height={ sx||16 } viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 3.5L3.5 12.5" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 12.5L3.5 3.5" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default CloseIcon;
