import { useState, useEffect } from 'react';
import {
  InputNumberSize,
  InputNumberStatus,
  InputNumberIconSizeType,
  InputNumberDataType,
} from './types';
import i18n from 'react-i18next';

import upIcon from '@src/static/images/icons/up.png';
import downIcon from '@src/static/images/icons/down.png';
import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './InputNumber.module.scss';
const cx = classNames.bind(style);

type Props = {
  status?: string;
  size?: string;
  value?: number;
  max?: number;
  min?: number;
  step?: number;
  name?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  upIcon?: string;
  downIcon?: string;
  customSize?: InputNumberIconSizeType;
  onChange?: (
    data: InputNumberDataType,
    e?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onBlur?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  t?: i18n.TFunction<'translation'>;
  theme?: ThemeType;
  disableIcon?: boolean;
  bottomTextExist?: boolean;
  error?: string;
  info?: string;
  valueAlign?: string;
};

function InputNumber({
  status,
  size,
  placeholder = '',
  isReadOnly,
  isDisabled,
  value,
  max,
  min,
  name,
  step = 1,
  upIcon,
  downIcon,
  customSize,
  theme,
  disableIcon,
  bottomTextExist,
  error,
  info,
  valueAlign = '',
  onChange,
  onBlur,
  t,
}: Props) {
  const [val, setVal] = useState<string>('');

  const onChangeData = (
    value: number | string,
    e?: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isReadOnly || isDisabled) return;
    if (max !== undefined && max < value) {
      setVal(String(max));
      if (onChange)
        onChange(
          {
            name,
            value: max,
            min,
            max,
            target: {
              value: String(value),
              name,
              min,
              max,
            },
          },
          e,
        );
      return;
    }

    if (value !== '' && min !== undefined && min > value) {
      setVal(String(min));
      if (onChange)
        onChange(
          {
            name,
            value: min,
            min,
            max,
            target: {
              value: String(value),
              name,
              min,
              max,
            },
          },
          e,
        );
      return;
    }

    setVal(String(value));
    if (onChange)
      onChange(
        {
          name,
          value,
          min,
          max,
          target: {
            value: String(value),
            name,
            min,
            max,
          },
        },
        e,
      );
  };

  const onCountUp = () => {
    if (val === undefined) {
      setVal('0');
      onChangeData(0);
      return;
    }

    const temp = String(step).split('.');
    if (temp.length >= 2) {
      onChangeData((Number(val) + step).toFixed(temp[1].length));
    } else {
      onChangeData(Number(val) + step);
    }
  };

  const onCountDown = () => {
    if (val === undefined) {
      setVal('0');
      onChangeData(0);
      return;
    }

    const temp = String(step).split('.');
    if (temp.length >= 2) {
      onChangeData((Number(val) - step).toFixed(temp[1].length));
    } else {
      onChangeData(Number(val) - step);
    }
  };

  useEffect(() => {
    setVal(() => {
      if (typeof value !== 'number') return '';

      if (min !== undefined && value < min) {
        return String(min);
      }
      if (max !== undefined && value > max) {
        return String(max);
      }

      if (!Number.isNaN(value)) {
        return String(value);
      }
      return '';
    });
  }, [max, min, value]);

  return (
    <div
      className={cx(
        'jp',
        'input-number',
        isReadOnly && 'read-only',
        size,
        status === InputNumberStatus.ERROR && 'error',
        theme,
        disableIcon && 'disableIcon',
      )}
    >
      <input
        name={name}
        min={min}
        max={max}
        step={step}
        pattern='[0-9]*'
        placeholder={t ? t(placeholder) : placeholder}
        value={val}
        disabled={isDisabled}
        readOnly={isReadOnly}
        style={customSize}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (isReadOnly || isDisabled) return;
          const val = e.target.value;
          if (val === '-' || val === '') {
            setVal(val);
            onChangeData(val, e);
            return;
          }
          const newVal = Number(val);
          if (Number.isNaN(newVal)) {
            if (val === '') {
              setVal('');
              onChangeData(val, e);
            }
            return;
          }
          if (val.length > 0 && val[val.length - 1] === '.') {
            setVal(val);
            onChangeData(val, e);
            return;
          }
          setVal(val);
          onChangeData(newVal, e);
        }}
        onWheel={(e) => e.currentTarget.blur()}
        onBlur={onBlur && onBlur}
        dir={`${valueAlign === 'right' ? 'rtl' : ''}`}
      />
      {!disableIcon && (
        <div className={cx('btn-box')}>
          {upIcon && (
            <button className={cx('up-btn')} onClick={onCountUp}>
              <img src={upIcon} alt='아이콘' />
            </button>
          )}
          {downIcon && (
            <button className={cx('down-btn')} onClick={onCountDown}>
              <img src={downIcon} alt='아이콘' />
            </button>
          )}
        </div>
      )}
      {bottomTextExist && (
        <div className={cx('bottom-text')}>
          {error && <span className={cx('error')}>{error}</span>}
          {!error && info && <span className={cx('info')}>{info}</span>}
        </div>
      )}
    </div>
  );
}

InputNumber.defaultProps = {
  status: InputNumberStatus.DEFAULT,
  size: InputNumberSize.MEDIUM,
  value: undefined,
  max: undefined,
  min: undefined,
  name: undefined,
  step: 1,
  isDisabled: false,
  isReadOnly: false,
  placeholder: '',
  upIcon,
  downIcon,
  customSize: undefined,
  onChange: undefined,
  onBlur: undefined,
  t: undefined,
  theme: theme.PRIMARY_THEME,
  disableIcon: false,
  bottomTextExist: false,
  error: undefined,
  info: undefined,
  valueAlign: '',
};

export default InputNumber;
