import styles from './CheckBox.module.scss';
import classNames from 'classnames/bind';
import React from 'react';
import { CheckedIcon } from '@src/static/images';
import { CSSProperties } from 'react';

const cx = classNames.bind(styles);

type StyleSet = {
  common?: CSSProperties;
  active?: CSSProperties;
  disabled?: CSSProperties;
};

export type CheckBoxProps = {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelStyle?: StyleSet;
  checkBoxStyle?: StyleSet;
};
const CheckBox = ({
  label,
  checked,
  disabled,
  onChange,
  labelStyle,
  checkBoxStyle,
}: CheckBoxProps) => {
  const styleSelector = (styles: StyleSet) => {
    if (disabled) return styles.disabled ?? {};
    if (checked) return styles.active ?? {};
    return styles.common ?? {};
  };
  return (
    <label>
      <div
        className={cx(
          'check-container',
          checked && 'checked',
          disabled && 'disabled',
        )}
      >
        <div
          style={checkBoxStyle && styleSelector(checkBoxStyle)}
          className={cx('check-mark')}
        >
          <img src={CheckedIcon} alt='checked' />
        </div>
        <input
          type='checkbox'
          onChange={onChange}
          checked={checked}
          disabled={disabled}
        />
        {label && (
          <div
            className={cx('label')}
            style={labelStyle && styleSelector(labelStyle)}
          >
            {label}
          </div>
        )}
      </div>
    </label>
  );
};

CheckBox.defaultProps = {
  label: '',
  checked: false,
  disabled: false,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
  labelStyle: {},
  checkBoxStyle: {},
};

export default CheckBox;
