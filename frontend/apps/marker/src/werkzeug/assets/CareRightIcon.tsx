import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 오른쪽으로 이동하기 위한 아이콘
 */
function CareRightIcon({
  size = 'mx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 24} height={sx || 24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M9.80539 6.53735C9.89775 6.50133 9.99841 6.49219 10.0957 6.511C10.1931 6.5298 10.2831 6.57577 10.3554 6.6436L15.3554 11.6436C15.4493 11.7384 15.502 11.8664 15.502 11.9999C15.502 12.1333 15.4493 12.2613 15.3554 12.3561L10.3554 17.3561C10.2594 17.4478 10.1319 17.4993 9.99914 17.4999C9.93278 17.4996 9.86706 17.4868 9.80539 17.4624C9.71439 17.4241 9.63675 17.3598 9.58225 17.2775C9.52775 17.1952 9.49883 17.0986 9.49914 16.9999V6.99985C9.49883 6.90114 9.52775 6.80455 9.58225 6.72224C9.63675 6.63994 9.71439 6.5756 9.80539 6.53735V6.53735Z" fill={color}/>
      </svg>
    </div>
  );
}

export default CareRightIcon;
