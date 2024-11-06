import i18n from 'react-i18next';

// Types
import { Properties as CSSProperties } from 'csstype';
import { OptionType } from './types';

import { theme } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from './Radio.module.scss';
const cx = classNames.bind(style);

type Props = {
  options: OptionType[];
  selectedValue: string | number;
  name?: string;
  customStyle?: CSSProperties;
  theme?: ThemeType;
  testId?: string;
  tooltipValue?: Set<string | number>;
  isReadonly?: boolean;
  onTooltipRender?: (value: string | number) => React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t?: i18n.TFunction<'translation'>;
};

function Radio({
  options = [],
  selectedValue,
  name,
  customStyle,
  theme,
  testId,
  tooltipValue,
  isReadonly,
  onTooltipRender,
  onChange,
  t,
}: Props) {
  return (
    <div className={cx('jp', 'radio')} style={customStyle} data-testid={testId}>
      <ul>
        {options.map((data: OptionType, idx) => {
          const { label, value, disabled, icon, labelStyle } = data;
          const id = `${idx}-${label}-${value}`;
          return (
            <li key={id}>
              <input
                className={cx(theme)}
                id={id}
                type='radio'
                name={name}
                disabled={(() => {
                  if (disabled) {
                    return true;
                  }
                  if (isReadonly) {
                    if (value === selectedValue) {
                      return false;
                    }
                    return true;
                  }
                  return false;
                })()}
                checked={value === selectedValue}
                value={value}
                onChange={onChange}
              />
              {label && (
                <label
                  htmlFor={id}
                  style={labelStyle}
                  className={cx(
                    theme,
                    (() => {
                      if (disabled) {
                        return 'disabled';
                      }
                      if (isReadonly && value !== selectedValue) {
                        return 'disabled';
                      }
                      return '';
                    })(),
                  )}
                >
                  {icon && (
                    <img
                      className={cx('label-icon')}
                      src={icon}
                      alt={label || 'label'}
                    />
                  )}
                  {t ? t(label) : label}
                </label>
              )}
              {onTooltipRender &&
                tooltipValue !== undefined &&
                tooltipValue.has(value) &&
                onTooltipRender(value)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

Radio.defaultProps = {
  name: undefined,
  customStyle: undefined,
  theme: theme.PRIMARY_THEME,
  testId: undefined,
  tooltipValue: undefined,
  isReadonly: false,
  onTooltipRender: undefined,
  onChange: undefined,
  t: undefined,
};

export default Radio;
