import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 프로젝트를 표시하기 위한 아이콘
 */
function ProjectIcon({
  size = 'nx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 12} height={sx || 12} viewBox="0 0 12 12" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M10.125 2.99996H8.21719C8.12694 2.47734 7.85499 2.0034 7.44932 1.66178C7.04365 1.32015 6.53035 1.13281 6 1.13281C5.46965 1.13281 4.95635 1.32015 4.55068 1.66178C4.14501 2.0034 3.87306 2.47734 3.78281 2.99996H1.875C1.67609 2.99996 1.48532 3.07897 1.34467 3.21963C1.20402 3.36028 1.125 3.55104 1.125 3.74996V9.74996C1.125 9.94887 1.20402 10.1396 1.34467 10.2803C1.48532 10.4209 1.67609 10.5 1.875 10.5H10.125C10.3239 10.5 10.5147 10.4209 10.6553 10.2803C10.796 10.1396 10.875 9.94887 10.875 9.74996V3.74996C10.875 3.55104 10.796 3.36028 10.6553 3.21963C10.5147 3.07897 10.3239 2.99996 10.125 2.99996ZM6 1.87496C6.33247 1.87559 6.65537 1.98632 6.91826 2.18985C7.18115 2.39338 7.36923 2.67824 7.45312 2.99996H4.54688C4.63077 2.67824 4.81885 2.39338 5.08174 2.18985C5.34463 1.98632 5.66753 1.87559 6 1.87496Z" fill={color}/>
      </svg>
    </div>
  );
}

export default ProjectIcon;
