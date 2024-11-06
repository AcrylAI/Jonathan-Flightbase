import { RED502 } from "@src/utils/color";
import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function FileRejectedIcon({
  size = 'sx',
  color = RED502,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx || 18 } height={ sx || 18 } viewBox="0 0 18 18" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5ZM0.5 9C0.5 4.30558 4.30558 0.5 9 0.5C13.6944 0.5 17.5 4.30558 17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9Z" fill={ color }/>
        <path d="M14.6004 9.00039C14.6004 12.0932 12.0932 14.6004 9.00039 14.6004C5.9076 14.6004 3.40039 12.0932 3.40039 9.00039C3.40039 5.9076 5.9076 3.40039 9.00039 3.40039C12.0932 3.40039 14.6004 5.9076 14.6004 9.00039Z" fill={ color }/>
        <path fillRule="evenodd" clipRule="evenodd" d="M11.3196 7.44167C11.5299 7.23139 11.5299 6.89046 11.3196 6.68017C11.1093 6.46989 10.7684 6.46989 10.5581 6.68017L9.00036 8.23788L7.44265 6.68017C7.23237 6.46989 6.89143 6.46989 6.68115 6.68017C6.47087 6.89046 6.47087 7.23139 6.68115 7.44167L8.23886 8.99938L6.68115 10.5571C6.47087 10.7674 6.47087 11.1083 6.68115 11.3186C6.89143 11.5289 7.23237 11.5289 7.44265 11.3186L9.00036 9.76088L10.5581 11.3186C10.7684 11.5289 11.1093 11.5289 11.3196 11.3186C11.5299 11.1083 11.5299 10.7674 11.3196 10.5571L9.76186 8.99938L11.3196 7.44167Z" fill="white"/>
      </svg>
    </div>
  );
}

export default FileRejectedIcon;
