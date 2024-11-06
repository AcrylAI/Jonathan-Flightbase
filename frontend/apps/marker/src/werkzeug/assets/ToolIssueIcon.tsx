import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 이슈 도구를 표현하기 위한 아이콘
 */
function ToolIssueIcon({
  size = 'lx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx||36 } height={ sx||36 } viewBox="0 0 36 36" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M10.2565 22.5748C9.13983 20.6908 8.74924 18.464 9.15804 16.3124C9.56684 14.1608 10.7469 12.2325 12.4768 10.8893C14.2066 9.54619 16.3672 8.88063 18.553 9.01761C20.7388 9.1546 22.7994 10.0847 24.348 11.6333C25.8966 13.1819 26.8267 15.2425 26.9637 17.4283C27.1007 19.6141 26.4351 21.7747 25.0919 23.5045C23.7488 25.2343 21.8204 26.4144 19.6689 26.8232C17.5173 27.232 15.2905 26.8414 13.4065 25.7248L10.294 26.606C10.1665 26.6433 10.0313 26.6456 9.90256 26.6127C9.77384 26.5798 9.65635 26.5128 9.5624 26.4189C9.46845 26.3249 9.4015 26.2074 9.36858 26.0787C9.33565 25.95 9.33796 25.8148 9.37525 25.6873L10.2565 22.5748Z" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default ToolIssueIcon;
