import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 파일명을 표시하기 위한 아이콘
 */
function FileIcon({
  size = 'nx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 12} height={sx || 12} viewBox="0 0 12 12" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0172 3.85782L7.39219 1.23282C7.32075 1.16317 7.22477 1.12444 7.125 1.12501H2.625C2.42609 1.12501 2.23532 1.20402 2.09467 1.34468C1.95402 1.48533 1.875 1.67609 1.875 1.87501V10.125C1.875 10.3239 1.95402 10.5147 2.09467 10.6553C2.23532 10.796 2.42609 10.875 2.625 10.875H9.375C9.57391 10.875 9.76468 10.796 9.90533 10.6553C10.046 10.5147 10.125 10.3239 10.125 10.125V4.12501C10.1256 4.02524 10.0868 3.92926 10.0172 3.85782ZM7.125 4.12501V2.06251L9.1875 4.12501H7.125Z" fill={color}/>
      </svg>
    </div>
  );
}

export default FileIcon;
