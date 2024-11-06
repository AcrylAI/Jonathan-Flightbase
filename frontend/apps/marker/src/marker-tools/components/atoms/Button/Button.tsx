import styles from './Button.module.scss';
import classNames from 'classnames/bind';

import { CommonProps, EventProps, InputProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  varient?: 'contain' | 'text' | 'outline';
  color?: 'red' | 'blue' | 'custom';
} & CommonProps &
  Pick<EventProps, 'onClick'> &
  Pick<InputProps, 'disabled'>;

function Button({
  varient = 'contain',
  color = 'blue',
  disabled = false,
  onClick,
  children,
  className,
  style,
}: Props) {
  return (
    <button
      className={cx('Button', varient, color, className)}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

export type { Props as ButtonPropType };

export default Button;
