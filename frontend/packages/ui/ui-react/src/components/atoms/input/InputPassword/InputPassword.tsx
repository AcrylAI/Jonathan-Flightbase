import { Properties as CSSProperties } from 'csstype';

import { useRef, useState } from 'react';
import { InputSize, InputStatus } from './types';

import i18n from 'react-i18next';

import leftIcon from '@src/static/images/icons/ic-lock.svg';
import showIcon from '@src/static/images/icons/00-ic-info-eye.svg';
import hideIcon from '@src/static/images/icons/00-ic-info-eye-off.svg';

import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './InputPassword.module.scss';
const cx = classNames.bind(style);

type Props = {
  status?: string;
  size?: string;
  name?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  disableLeftIcon?: boolean;
  disableShowBtn?: boolean;
  placeholder?: string;
  value?: string;
  leftIcon?: string;
  customStyle?: CSSProperties;
  options?: { [key: string]: string };
  tabIndex?: number;
  autoFocus?: boolean;
  testId?: string;
  theme?: ThemeType;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly t?: i18n.TFunction<'translation'>;
};

interface InputAttr {
  disabled: boolean;
  readOnly: boolean;
}

function InputPassword({
  status,
  size,
  name,
  isDisabled,
  isReadOnly,
  disableLeftIcon,
  disableShowBtn,
  placeholder,
  value,
  leftIcon,
  customStyle,
  options,
  tabIndex,
  autoFocus,
  testId,
  onChange,
  onKeyPress,
  t,
  theme,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputAttr: InputAttr = {
    ...options,
    disabled: false,
    readOnly: false,
  };

  // 비밀번호 보기/숨기기
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  if (isDisabled) {
    inputAttr.disabled = true;
  } else if (isReadOnly) {
    inputAttr.readOnly = true;
  }

  const paddingHandler = (): string => {
    if (disableLeftIcon && disableShowBtn) {
      return 'normal-padding';
    }

    if (!disableShowBtn && !disableLeftIcon) {
      return 'left-right-padding';
    }

    if (!disableShowBtn && disableLeftIcon) {
      return 'right-padding';
    }
    return 'left-padding';
  };

  return (
    <div
      className={cx(
        'jp',
        'input',
        size,
        status,
        !disableLeftIcon && 'left',
        theme,
      )}
    >
      <input
        className={cx(paddingHandler())}
        type={passwordShown ? 'text' : 'password'}
        placeholder={t ? t(placeholder || '') : placeholder}
        {...inputAttr}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        ref={inputRef}
        style={{
          ...customStyle,
        }}
        name={name}
        tabIndex={tabIndex}
        autoFocus={autoFocus}
        data-testid={testId}
      />
      {!disableLeftIcon && leftIcon && (
        <img className={cx('visible-left-icon')} src={leftIcon} alt='아이콘' />
      )}
      {!disableShowBtn && (
        <button
          className={cx('show-hide-btn')}
          onClick={togglePassword}
          tabIndex={-1}
        >
          <img src={passwordShown ? showIcon : hideIcon} alt='show/hide' />
        </button>
      )}
    </div>
  );
}

InputPassword.defaultProps = {
  status: InputStatus.DEFAULT,
  size: InputSize.MEDIUM,
  name: undefined,
  isDisabled: false,
  isReadOnly: false,
  disableLeftIcon: false,
  disableShowBtn: false,
  placeholder: undefined,
  value: undefined,
  leftIcon,
  customStyle: undefined,
  options: undefined,
  tabIndex: undefined,
  autoFocus: false,
  testId: undefined,
  onChange: undefined,
  onKeyPress: undefined,
  t: undefined,
  theme: theme.PRIMARY_THEME,
};

export default InputPassword;
