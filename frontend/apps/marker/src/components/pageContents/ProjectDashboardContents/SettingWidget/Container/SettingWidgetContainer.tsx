import { Sypo } from '@src/components/atoms';

import { BLUE110, LIME603 } from '@src/utils/color';

import styles from './SettingWidgetContainer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Status = 'set' | 'unset';

type Props = {
  icon?: JSX.Element;
  label?: string;
  status?: Status;
  extend?: boolean;
  color?: string;
  moveIcon?: string;
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};
const SettingWidgetContainer = ({
  icon,
  label,
  status,
  extend,
  color,
  moveIcon,
  isLoading,
  onClick,
  disabled = false,
}: Props) => {
  const onClickContainer = () => {
    if (disabled) return;

    if (!isLoading && onClick) onClick();
  };
  const getColor = (): string => {
    let result = '#fff';
    if (status === 'set') {
      result = LIME603;
    } else {
      result = BLUE110;
    }
    if (color) {
      result = color;
    }

    return result;
  };
  return (
    <div
      className={cx(
        'widget-container',
        extend && 'extend',
        isLoading && 'loading',
        status,
        disabled && 'disabled',
      )}
    >
      <div
        className={cx('setting-container', status === 'set' && 'set')}
        style={color ? { borderColor: `${color}` } : {}}
        onClick={onClickContainer}
      >
        <div className={cx('icon')}>{icon}</div>
        {moveIcon && (
          <div className={cx('move-icon')}>
            <img src={moveIcon} alt='move' />
          </div>
        )}
        <div className={cx('label')}>
          <Sypo
            type={label && label?.length > 12 ? 'P2' : 'P1'}
            weight='R'
            color={getColor()}
          >
            {label}
          </Sypo>
        </div>
      </div>
    </div>
  );
};

SettingWidgetContainer.defaultProps = {
  extend: false,
  status: 'unset',
  moveIcon: '',
  isLoading: false,
  icon: <></>,
  label: '',
  color: '',
  onClick: () => {},
  disabled: false,
};

export default SettingWidgetContainer;
