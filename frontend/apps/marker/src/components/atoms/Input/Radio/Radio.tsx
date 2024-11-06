import styles from './Radio.module.scss';
import classNames from 'classnames/bind';
import React, { CSSProperties } from 'react';
import { Sypo } from '../../Typography/Typo';

const cx = classNames.bind(styles);

type StyleSet = {
  common?: CSSProperties;
  active?: CSSProperties;
  disabled?: CSSProperties;
};

type RadioType = {
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  customLabelStyle?: StyleSet;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
const Radio = ({
  selected,
  disabled,
  customLabelStyle,
  label,
  onChange,
}: RadioType) => {
  const styleSelector = (styles: StyleSet) => {
    if (disabled) return styles.disabled ?? {};
    if (selected) return styles.active ?? {};
    return styles.common ?? {};
  };
  return (
    <label>
      <div
        className={cx(
          'radio-container',
          selected && 'active',
          disabled && 'disabled',
        )}
      >
        <input
          type='radio'
          checked={selected}
          disabled={disabled}
          onChange={onChange}
        />
        <div className={cx('radio-mark')}>
          <div className={cx('out-circle')}></div>
          <div className={cx('in-circle')}></div>
        </div>

        {label && (
          <div
            style={customLabelStyle && styleSelector(customLabelStyle)}
            className={cx('label')}
          >
            {label}
          </div>
        )}
      </div>
    </label>
  );
};

Radio.defaultProps = {
  label: '',
  selected: false,
  disabled: false,
  customLabelStyle: {},
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {},
};
export default Radio;
