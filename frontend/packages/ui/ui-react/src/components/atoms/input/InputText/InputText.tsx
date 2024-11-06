import { useRef } from 'react';
import i18n from 'react-i18next';

// Types
import { InputSize, InputStatus } from './types';
import { Properties as CSSProperties } from 'csstype';

// Icons
import closeIcon from '@src/static/images/icons/close-c.svg';
import leftIcon from '@src/static/images/icons/ic-search.svg';
import darkLeftIcon from '@src/static/images/icons/dark-search.svg';

import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './InputText.module.scss';
const cx = classNames.bind(style);

type Props = {
  status?: string;
  size?: string;
  name?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  disableClearBtn?: boolean;
  disableLeftIcon?: boolean;
  disableRightIcon?: boolean;
  placeholder?: string;
  value?: string;
  leftIcon?: string;
  rightIcon?: string;
  closeIcon?: string;
  customStyle?: CSSProperties;
  leftIconStyle?: CSSProperties;
  rightIconStyle?: CSSProperties;
  closeIconStyle?: CSSProperties;
  options?: { [key: string]: string };
  tabIndex?: number;
  autoFocus?: boolean;
  isLowercase?: boolean;
  theme?: ThemeType;
  testId?: string;
  readonly onClear?: (e?: HTMLInputElement) => void;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onBlur?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  readonly t?: i18n.TFunction<'translation'>;
};

interface InputAttr {
  disabled: boolean;
  readOnly: boolean;
}

function InputText({
  status,
  size,
  name,
  isDisabled,
  isReadOnly,
  disableClearBtn,
  disableLeftIcon,
  disableRightIcon,
  placeholder,
  value,
  leftIcon,
  rightIcon,
  closeIcon,
  customStyle,
  leftIconStyle,
  rightIconStyle,
  closeIconStyle,
  options,
  tabIndex,
  onChange,
  onClear,
  onBlur,
  autoFocus,
  isLowercase,
  theme,
  testId,
  t,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputAttr: InputAttr = {
    ...options,
    disabled: false,
    readOnly: false,
  };

  const clearText = () => {
    if (onClear && inputRef.current) {
      inputRef.current.value = '';
      onClear(inputRef.current);
    }
  };

  if (isDisabled) {
    inputAttr.disabled = true;
  } else if (isReadOnly) {
    inputAttr.readOnly = true;
  }

  const paddingHandler = (): string => {
    if (disableLeftIcon && disableClearBtn) {
      if (rightIcon) {
        return 'right-padding';
      }
      return 'normal-padding';
    }

    if (!disableClearBtn && !disableLeftIcon) {
      if (rightIcon) {
        return 'left-padding-right-double-padding';
      }

      return 'left-right-padding';
    }

    if (!disableClearBtn && disableLeftIcon) {
      if (rightIcon) {
        return 'right-double-padding';
      }

      return 'right-padding';
    }

    return 'left-padding';
  };

  return (
    <div
      className={cx(
        'jp',
        'input',
        theme,
        size,
        status,
        !disableLeftIcon && 'left',
      )}
    >
      <input
        className={cx(paddingHandler())}
        type='text'
        placeholder={t ? t(placeholder || '') : placeholder}
        {...inputAttr}
        value={value}
        onChange={
          isLowercase
            ? (e) => {
                e.target.value = e.target.value.toLowerCase();
                if (onChange) {
                  onChange(e);
                }
              }
            : onChange
        }
        ref={inputRef}
        style={{
          ...customStyle,
        }}
        name={name}
        autoFocus={autoFocus}
        autoComplete='off'
        tabIndex={tabIndex}
        data-testid={testId}
        onBlur={onBlur && onBlur}
      />
      {!disableLeftIcon && leftIcon && (
        <img
          className={cx(
            disableLeftIcon ? 'disabled-left-icon' : 'visible-left-icon',
          )}
          src={theme === 'jp-dark' ? darkLeftIcon : leftIcon}
          style={leftIconStyle}
          alt='left-icon'
        />
      )}
      {!disableRightIcon && rightIcon && (
        <img
          className={cx('right-icon')}
          src={rightIcon}
          style={rightIconStyle}
          alt='right-icon'
        />
      )}
      {!disableClearBtn && value !== '' && !isDisabled && !isReadOnly && (
        <button
          className={cx(
            'close-btn',
            !disableRightIcon && rightIcon && 'exist-right-icon',
          )}
          onClick={clearText}
          style={closeIconStyle}
          tabIndex={-1}
        >
          <img src={closeIcon} alt='close button' />
        </button>
      )}
    </div>
  );
}

InputText.defaultProps = {
  status: InputStatus.DEFAULT,
  size: InputSize.MEDIUM,
  name: undefined,
  isDisabled: false,
  isReadOnly: false,
  disableClearBtn: true,
  disableLeftIcon: true,
  disableRightIcon: true,
  placeholder: undefined,
  value: undefined,
  leftIcon,
  rightIcon: undefined,
  closeIcon,
  customStyle: undefined,
  closeIconStyle: undefined,
  leftIconStyle: undefined,
  rightIconStyle: undefined,
  options: undefined,
  tabIndex: undefined,
  onClear: undefined,
  onChange: undefined,
  onBlur: undefined,
  autoFocus: false,
  isLowercase: false,
  theme: theme.PRIMARY_THEME,
  testId: undefined,
  t: undefined,
};

export default InputText;
