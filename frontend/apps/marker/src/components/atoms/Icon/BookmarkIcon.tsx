import { MONO204 } from '@src/utils/color';

import { CommonIconProps } from './type';

/**
 * 색상 지정이 가능한 고정 크기의 Bookmark Icon
 * @icon
 * @author Roha
 * @version 22-11-16
 */
function BookmarkIcon({ color = MONO204, fill = 'none' }: CommonIconProps) {
  return (
    <div style={{ width: '24px', height: '24px' }}>
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        fill={fill}
      >
        <path
          d='M18 21L12 17.25L6 21V4.5C6 4.30109 6.07902 4.11032 6.21967 3.96967C6.36032 3.82902 6.55109 3.75 6.75 3.75H17.25C17.4489 3.75 17.6397 3.82902 17.7803 3.96967C17.921 4.11032 18 4.30109 18 4.5V21Z'
          stroke={color}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default BookmarkIcon;
