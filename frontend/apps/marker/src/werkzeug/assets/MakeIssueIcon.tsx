import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 이슈 생성을 표시하기 위한 아이콘
 */
function MakeIssueIcon({
  size = 'mx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 24} height={sx || 24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10"/>
        <path d="M8.82227 11.4281L12.0004 8.25L15.1785 11.4281" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15.75V8.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default MakeIssueIcon;
