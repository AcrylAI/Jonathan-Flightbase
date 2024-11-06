import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 이동 도구를 표현하기 위한 아이콘
 */
function ToolHandIcon({
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
          d='M21.7504 17.25V12.375C21.7504 11.8777 21.948 11.4008 22.2996 11.0492C22.6513 10.6975 23.1282 10.5 23.6254 10.5C24.1227 10.5 24.5996 10.6975 24.9513 11.0492C25.3029 11.4008 25.5004 11.8777 25.5004 12.375V20.25C25.5004 21.2349 25.3065 22.2102 24.9295 23.1201C24.5526 24.0301 24.0002 24.8569 23.3037 25.5533C22.6073 26.2497 21.7805 26.8022 20.8706 27.1791C19.9606 27.556 18.9854 27.75 18.0004 27.75C13.8567 27.75 12.0004 25.5 8.9442 19.0594C8.69556 18.628 8.62847 18.1155 8.75769 17.6346C8.88692 17.1538 9.20187 16.744 9.63326 16.4953C10.0647 16.2467 10.5771 16.1796 11.058 16.3088C11.5389 16.438 11.9487 16.753 12.1973 17.1844L14.2504 20.7469V10.875C14.2504 10.3777 14.448 9.90081 14.7996 9.54917C15.1513 9.19754 15.6282 9 16.1254 9C16.6227 9 17.0996 9.19754 17.4513 9.54917C17.8029 9.90081 18.0004 10.3777 18.0004 10.875V17.25'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M21.75 12.375V9.375C21.75 8.87772 21.5525 8.40081 21.2008 8.04917C20.8492 7.69754 20.3723 7.5 19.875 7.5C19.3777 7.5 18.9008 7.69754 18.5492 8.04917C18.1975 8.40081 18 8.87772 18 9.375V10.875'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}

export default ToolHandIcon;
