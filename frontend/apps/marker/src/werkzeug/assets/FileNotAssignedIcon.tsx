import { MONO208 } from "@src/utils/color";
import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function FileNotAssignedIcon({
  size = 'sx',
  color = MONO208,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 16} height={sx || 16} viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5295 8.00012C15.5295 12.1585 12.1585 15.5295 8.00012 15.5295C3.84174 15.5295 0.470703 12.1585 0.470703 8.00012C0.470703 3.84174 3.84174 0.470703 8.00012 0.470703C12.1585 0.470703 15.5295 3.84174 15.5295 8.00012Z" fill="white"/>
        <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8Z" fill={ color }/>
        <path fillRule="evenodd" clipRule="evenodd" d="M8 0.941176C4.10152 0.941176 0.941176 4.10152 0.941176 8C0.941176 11.8985 4.10152 15.0588 8 15.0588C11.8985 15.0588 15.0588 11.8985 15.0588 8C15.0588 4.10152 11.8985 0.941176 8 0.941176ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z" fill={ color }/>
      </svg>
    </div>
  );
}

export default FileNotAssignedIcon;
