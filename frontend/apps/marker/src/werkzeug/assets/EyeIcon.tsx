import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 보이기/숨김을 표현하기 위한 아이콘 : alt(boolean)을 이용해 변형 가능
 */
function EyeIcon({
  size = 'mx',
  color = 'currentColor',
  fill = 'none',
  alt = false
}: CommonIconProps) {
  const sx = useIconSizing(size);

  if (alt === true) {
    return (
      <div className={ cx('IconBox') }>
        <svg
          width={ sx || 24 }
          height={ sx || 24 }
          viewBox='0 0 24 24'
          fill={ fill }
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M7 6.50024L17 17.5002'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M13.681 13.8499C13.2222 14.2702 12.6219 14.5023 11.9997 14.4999C11.4951 14.4998 11.0024 14.3471 10.5862 14.0618C10.1701 13.7764 9.85001 13.3718 9.66811 12.9012C9.4862 12.4305 9.45097 11.9158 9.56705 11.4248C9.68313 10.9337 9.94509 10.4893 10.3185 10.1499'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M8.625 8.28735C6.075 9.57485 5 11.9999 5 11.9999C5 11.9999 7 16.4999 12 16.4999C13.1716 16.5094 14.3286 16.2394 15.375 15.7124'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M17.0383 14.5688C18.4008 13.35 19.0008 12 19.0008 12C19.0008 12 17.0008 7.50002 12.0008 7.50002C11.5673 7.49916 11.1345 7.5347 10.707 7.60627'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M12.4688 9.54419C13.0004 9.64492 13.4849 9.91585 13.849 10.3161C14.2132 10.7163 14.4373 11.2242 14.4875 11.7629'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    );
  } else {
    return (
      <div className={ cx('IconBox') }>
        <svg
          width={ sx || 24 }
          height={ sx || 24 }
          viewBox='0 0 24 24'
          fill={ fill }
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M12 7.5C7 7.5 5 12 5 12C5 12 7 16.5 12 16.5C17 16.5 19 12 19 12C19 12 17 7.5 12 7.5Z'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z'
            stroke={ color }
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    );
  }

}

export default EyeIcon;
