import { ButtonSize, ButtonType } from './types';
import { Properties as CSSProperties } from 'csstype';
import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './Button.module.scss';
const cx = classNames.bind(style);

type Props = {
  type?: string;
  size?: string;
  theme?: ThemeType;
  children?: any;
  disabled?: boolean;
  icon?: string;
  iconAlign?: string;
  iconStyle?: CSSProperties;
  customStyle?: CSSProperties;
  testId?: string;
  title?: string;
  loading?: boolean;
  btnType?: 'button' | 'submit' | 'reset';
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseOut?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const noop = () => {};

function Button({
  type,
  size,
  theme,
  children,
  disabled,
  icon,
  iconAlign,
  iconStyle,
  customStyle,
  testId,
  title,
  loading,
  btnType = 'button',
  onClick,
  onMouseOver,
  onMouseOut,
}: Props): JSX.Element {
  if (icon) {
    return (
      <button
        className={cx(
          'jp',
          'btn',
          type,
          size,
          theme,
          `icon-${iconAlign}`,
          loading && 'loading',
        )}
        onClick={loading ? noop : onClick}
        style={customStyle}
        disabled={disabled}
        data-testid={testId}
        title={title}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        type={btnType}
      >
        {iconAlign === 'left' && (
          <img className={cx('icon')} src={icon} style={iconStyle} alt='icon' />
        )}
        {children}
        {iconAlign === 'right' && (
          <img className={cx('icon')} src={icon} style={iconStyle} alt='icon' />
        )}
      </button>
    );
  }

  return (
    <button
      className={cx('jp', 'btn', type, size, loading && 'loading', theme)}
      onClick={loading ? noop : onClick}
      disabled={disabled}
      style={customStyle}
      data-testid={testId}
      title={title}
      type={btnType}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </button>
  );
}

Button.defaultProps = {
  type: ButtonType.PRIMARY,
  size: ButtonSize.MEDIUM,
  theme: theme.PRIMARY_THEME,
  children: undefined,
  disabled: false,
  icon: undefined,
  iconAlign: 'left',
  iconStyle: undefined,
  btnType: 'button',
  customStyle: undefined,
  testId: undefined,
  title: undefined,
  loading: false,
  onClick: undefined,
  onMouseOver: undefined,
  onMouseOut: undefined,
};

export default Button;
