import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 리셋 버튼을 위한 아이콘
 */
function ResetIcon({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 16}
        height={sx || 16}
        viewBox='0 0 16 16'
        fill={ fill }
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_1155_5382)'>
          <path
            d='M4.98828 6.2312H1.98828V3.2312'
            stroke={color}
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M4.11328 11.8875C4.88229 12.6571 5.86229 13.1814 6.92931 13.394C7.99633 13.6066 9.10242 13.4979 10.1077 13.0818C11.1129 12.6656 11.9722 11.9607 12.5767 11.0561C13.1813 10.1515 13.504 9.08799 13.504 8C13.504 6.91201 13.1813 5.84847 12.5767 4.9439C11.9722 4.03933 11.1129 3.33439 10.1077 2.91824C9.10242 2.50209 7.99633 2.39343 6.92931 2.60601C5.86229 2.81859 4.88229 3.34286 4.11328 4.1125L1.98828 6.23125'
            stroke={color}
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </g>
        <defs>
          <clipPath id='clip0_1155_5382'>
            <rect width='16' height='16' fill='white' />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export default ResetIcon;
