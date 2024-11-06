import { Properties as CSSProperties } from 'csstype';

import { SwitchInit, SwitchSize } from './types';

import classNames from 'classnames/bind';
import style from './Switch.module.scss';
const cx = classNames.bind(style);

type Props = {
  size?: string;
  checked: boolean;
  disabled?: boolean;
  label?: string;
  message?: string;
  customStyle?: CSSProperties;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: string;
};

function Switch({
  size,
  checked,
  disabled,
  label,
  message,
  customStyle,
  name,
  onChange,
  labelAlign,
}: Props): JSX.Element {
  return (
    <div className={cx('jp', 'switch', size)} title={message}>
      <label className={cx('switch-container')}>
        {labelAlign === 'left' && label && (
          <div className={cx('combining-left')}>{label}</div>
        )}
        <input
          onChange={onChange}
          type='checkbox'
          checked={checked}
          disabled={disabled}
          name={name}
        />
        <span style={customStyle}></span>
        {labelAlign !== 'left' && label && (
          <div className={cx('combining')}>{label}</div>
        )}
      </label>
    </div>
  );
}

Switch.defaultProps = {
  size: SwitchSize.MEDIUM,
  disabled: SwitchInit.disabled,
  label: undefined,
  message: undefined,
  customStyle: undefined,
  name: '',
  onChange: undefined,
  labelAlign: 'right',
};

export default Switch;
