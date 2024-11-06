import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 왼쪽으로 이동을 표시하기 위한 아이콘
 */
function CareLeftIcon({
  size = 'mx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={sx || 24} height={sx || 24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <path d="M14.1946 6.53735C14.1023 6.50133 14.0016 6.49219 13.9043 6.511C13.8069 6.5298 13.7169 6.57577 13.6446 6.6436L8.64461 11.6436C8.55072 11.7384 8.49805 11.8664 8.49805 11.9999C8.49805 12.1333 8.55072 12.2613 8.64461 12.3561L13.6446 17.3561C13.7406 17.4478 13.8681 17.4993 14.0009 17.4999C14.0672 17.4996 14.1329 17.4868 14.1946 17.4624C14.2856 17.4241 14.3633 17.3598 14.4178 17.2775C14.4723 17.1952 14.5012 17.0986 14.5009 16.9999V6.99985C14.5012 6.90114 14.4723 6.80455 14.4178 6.72224C14.3633 6.63994 14.2856 6.5756 14.1946 6.53735V6.53735Z" fill={color}/>
      </svg>
    </div>
  );
}

export default CareLeftIcon;
