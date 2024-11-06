import classNames from 'classnames/bind';
import styles from './IconBox.module.scss';
import useIconSizing from '@src/components/atoms/Icon/useIconSizing';
import { CommonIconProps } from '@src/components/atoms/Icon/type';
import { BLUE103 } from '@src/utils/color';

const cx = classNames.bind(styles);

/**
 * useIconSizing을 이용한 Guard 없는 Delete Icon
 * @icon
 * @author Dawson
 * @version 22-10-05
 */
function DeleteIcon({
  size = 'default',
  color = BLUE103,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg
        width={sx || 24}
        height={sx || 24}
        viewBox='0 0 24 24'
        fill={fill}
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M17.5 7.5H6.5'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.5 10.5V14.5'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.5 10.5V14.5'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.5 7.5V17C16.5 17.1326 16.4473 17.2598 16.3536 17.3536C16.2598 17.4473 16.1326 17.5 16 17.5H8C7.86739 17.5 7.74021 17.4473 7.64645 17.3536C7.55268 17.2598 7.5 17.1326 7.5 17V7.5'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14.5 7.5V6.5C14.5 6.23478 14.3946 5.98043 14.2071 5.79289C14.0196 5.60536 13.7652 5.5 13.5 5.5H10.5C10.2348 5.5 9.98043 5.60536 9.79289 5.79289C9.60536 5.98043 9.5 6.23478 9.5 6.5V7.5'
          stroke={color}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  );
}

export default DeleteIcon;
