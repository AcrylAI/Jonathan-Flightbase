import { useTranslation } from 'react-i18next';
import { Tooltip } from '@jonathan/ui-react';

// CSS module
import classNames from 'classnames/bind';
import style from './Radio.module.scss';
const cx = classNames.bind(style);

const noop = () => {};

/**
 *
 * @param {{
 *  options: Array,
 *  value: string,
 *  name: string,
 *  onChange: Function,
 *  readOnly: boolean,
 *  customStyle: object,
 *  testId: string,
 * }}
 */
function Radio({
  options,
  value,
  name,
  onChange = noop,
  readOnly,
  customStyle = {},
  testId,
}) {
  const { t } = useTranslation();
  return (
    <div className={cx('radio-box')} style={customStyle} data-testid={testId}>
      {options.map(
        ({ label, value: val, disabled, icon, labelStyle, tooltip }, idx) => (
          <label
            key={idx}
            className={cx('radio-btn', disabled && 'disabled')}
            style={labelStyle}
          >
            <input
              type='radio'
              name={name}
              value={val}
              checked={val === value}
              onChange={onChange}
              disabled={readOnly ? value !== val : disabled}
            />
            {icon && (
              <img className={cx('label-icon')} src={icon} alt={label} />
            )}
            <span>{t(label)}</span>
            {tooltip && (
              <Tooltip
                contents={t('release.Message')}
                contentsAlign={{ vertical: 'top' }}
              />
            )}
          </label>
        ),
      )}
    </div>
  );
}

export default Radio;
