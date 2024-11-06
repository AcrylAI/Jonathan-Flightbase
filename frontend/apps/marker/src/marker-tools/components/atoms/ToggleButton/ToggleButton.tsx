import styles from './ToggleButton.module.scss';
import classNames from 'classnames/bind';

import { CommonProps, EventProps, InputProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = CommonProps &
  Pick<InputProps, 'disabled' | 'selected'> &
  Pick<EventProps, 'onClick'>;

function ToggleButton({
  onClick,
  selected,
  disabled,
  className,
  children,
  style,
}: Props) {
  const _onClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={cx('toggle-button', { selected }, className)}
      style={style}
      onClick={_onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export type { Props as ToggleButtonPropType };

export default ToggleButton;
