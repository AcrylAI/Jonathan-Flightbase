import { Properties as CSSProperties } from 'csstype';

import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './Checkbox.module.scss';
const cx = classNames.bind(style);

type Props = {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  theme?: ThemeType;
  customLabelStyle?: { [key: string]: string };
  customStyle?: CSSProperties;
  name?: string;
  value?: number;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Checkbox({
  label,
  checked,
  disabled,
  customLabelStyle,
  customStyle,
  onChange,
  theme,
  name,
  value,
}: Props): JSX.Element {
  return (
    <div className={cx('jp', 'checkbox')}>
      <label className={cx('check-container')} style={customStyle}>
        <input
          onChange={onChange}
          type='checkbox'
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
        />
        <span className={cx('checkmark', theme)} />
        {label && (
          <div
            className={cx('combining', disabled && 'disabled')}
            style={customLabelStyle}
          >
            {label}
          </div>
        )}
      </label>
    </div>
  );
}

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  label: undefined,
  onChange: undefined,
  theme: theme.PRIMARY_THEME,
  customLabelStyle: undefined,
  customStyle: undefined,
  name: undefined,
  value: undefined,
};

export default Checkbox;
