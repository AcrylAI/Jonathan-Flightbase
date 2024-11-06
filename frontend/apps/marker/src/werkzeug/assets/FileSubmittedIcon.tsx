import { YELLOW303 } from "@src/utils/color";
import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function FileSubmittedIcon({
  size = 'sx',
  color = YELLOW303,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx || 16 } height={ sx || 16 } viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5295 8.00012C15.5295 12.1585 12.1585 15.5295 8.00012 15.5295C3.84174 15.5295 0.470703 12.1585 0.470703 8.00012C0.470703 3.84174 3.84174 0.470703 8.00012 0.470703C12.1585 0.470703 15.5295 3.84174 15.5295 8.00012Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M8 0.941176C4.10152 0.941176 0.941176 4.10152 0.941176 8C0.941176 11.8985 4.10152 15.0588 8 15.0588C11.8985 15.0588 15.0588 11.8985 15.0588 8C15.0588 4.10152 11.8985 0.941176 8 0.941176ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z" fill={ color }/>
        <path d="M12.7992 8.0002C12.7992 10.6512 10.6502 12.8002 7.99922 12.8002C5.34825 12.8002 3.19922 10.6512 3.19922 8.0002C3.19922 5.34923 5.34825 3.2002 7.99922 3.2002C10.6502 3.2002 12.7992 5.34923 12.7992 8.0002Z" fill={ color }/>
        <path d="M6.40078 7.9998C6.40078 7.55798 6.04261 7.1998 5.60078 7.1998C5.15895 7.1998 4.80078 7.55798 4.80078 7.9998C4.80078 8.44163 5.15895 8.7998 5.60078 8.7998C6.04261 8.7998 6.40078 8.44163 6.40078 7.9998Z" fill="white"/>
        <path d="M8.79922 7.9998C8.79922 7.55798 8.44105 7.1998 7.99922 7.1998C7.55739 7.1998 7.19922 7.55798 7.19922 7.9998C7.19922 8.44163 7.55739 8.7998 7.99922 8.7998C8.44105 8.7998 8.79922 8.44163 8.79922 7.9998Z" fill="white"/>
        <path d="M11.1996 7.9998C11.1996 7.55798 10.8414 7.1998 10.3996 7.1998C9.95778 7.1998 9.59961 7.55798 9.59961 7.9998C9.59961 8.44163 9.95778 8.7998 10.3996 8.7998C10.8414 8.7998 11.1996 8.44163 11.1996 7.9998Z" fill="white"/>
      </svg>
    </div>
  );
}

export default FileSubmittedIcon;
