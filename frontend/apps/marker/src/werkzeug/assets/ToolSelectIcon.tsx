import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 선택 도구를 표현하기 위한 아이콘
 */
function ToolSelectIcon({
  size = 'lx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 36}
        height={sx || 36}
        viewBox='0 0 36 36'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M9.50532 10.4625L14.9991 26.3344C15.2334 27.0188 16.2084 27 16.4241 26.3063L18.6366 19.125C18.67 19.0077 18.7333 18.901 18.8204 18.8155C18.9076 18.73 19.0154 18.6687 19.1334 18.6375L26.3053 16.425C26.9991 16.2094 27.0178 15.2344 26.3334 15L10.4616 9.50629C10.3282 9.45943 10.1843 9.4512 10.0465 9.48256C9.90867 9.51392 9.78251 9.58359 9.68256 9.68354C9.58261 9.78349 9.51294 9.90965 9.48158 10.0475C9.45022 10.1853 9.45845 10.3292 9.50532 10.4625V10.4625Z'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}

export default ToolSelectIcon;
