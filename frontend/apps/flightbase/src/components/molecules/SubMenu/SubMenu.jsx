// i18n
import { withTranslation } from 'react-i18next';

// CSS module
import style from './SubMenu.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const SubMenu = ({
  option,
  select,
  onChangeHandler,
  responsive = false,
  customStyle,
  size = 'medium',
  t,
}) => {
  return (
    <div
      className={cx('sub-menu', size, responsive && 'responsive')}
      style={customStyle}
    >
      {option.map(({ label, value, icon }) => (
        <div
          key={value}
          className={cx('menu-item', value === 'builtIn' && 'disabled')}
        >
          <input
            type='radio'
            id={`type-${value}`}
            name='type'
            value={value}
            checked={select.value === value}
            className={cx('hide-input')}
            onChange={() => {
              onChangeHandler({ label, value });
            }}
            disabled={value === 'builtIn'}
          />
          <label
            htmlFor={`type-${value}`}
            className={cx(
              'btn',
              select.value === value && 'selected',
              value === 'builtIn' && 'disabeld',
            )}
            style={{ cursor: value === 'builtIn' && 'not-allowed' }}
          >
            {icon && (
              <img
                className={cx('label-icon')}
                src={select.value === value ? icon[1] : icon[0]}
                alt={label}
              />
            )}
            {t(label)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default withTranslation()(SubMenu);
