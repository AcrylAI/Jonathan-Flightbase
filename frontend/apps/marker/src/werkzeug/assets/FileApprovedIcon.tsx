import { LIME603 } from "@src/utils/color";
import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function FileApprovedIcon({
  size = 'sx',
  color = LIME603,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx || 18 } height={ sx || 18 } viewBox="0 0 18 18" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5ZM0.5 9C0.5 4.30558 4.30558 0.5 9 0.5C13.6944 0.5 17.5 4.30558 17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9Z" fill={ color }/>
        <path d="M14.6004 9.00039C14.6004 12.0932 12.0932 14.6004 9.00039 14.6004C5.9076 14.6004 3.40039 12.0932 3.40039 9.00039C3.40039 5.9076 5.9076 3.40039 9.00039 3.40039C12.0932 3.40039 14.6004 5.9076 14.6004 9.00039Z" fill={ color }/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12.3426 6.73486C12.5529 6.94514 12.5529 7.28608 12.3426 7.49636L8.57336 11.2656C8.36308 11.4759 8.02214 11.4759 7.81186 11.2656L5.92724 9.38098C5.71696 9.17069 5.71696 8.82976 5.92724 8.61948C6.13753 8.40919 6.47846 8.40919 6.68874 8.61948L8.19261 10.1233L11.5811 6.73486C11.7914 6.52458 12.1323 6.52458 12.3426 6.73486Z" fill="white"/>
      </svg>
    </div>
  );
}

export default FileApprovedIcon;
