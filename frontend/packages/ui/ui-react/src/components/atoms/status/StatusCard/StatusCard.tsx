import { useState } from 'react';
import i18n from 'react-i18next';

// Types
import { Properties as CSSProperties } from 'csstype';
import {
  RunningType,
  PendingType,
  DoneType,
  ErrorType,
  UnknownType,
  InProgressType,
} from './types';
import { theme } from '@src/utils';

import Balloon from './Balloon';

// CSS Module
import classNames from 'classnames/bind';
import style from './StatusCard.module.scss';
const cx = classNames.bind(style);

type Props = {
  text?: string;
  status?:
    | RunningType
    | PendingType
    | DoneType
    | ErrorType
    | UnknownType
    | InProgressType;
  size?: 'x-small' | 'small' | 'medium' | 'large';
  type?: 'help' | 'default';
  theme?: ThemeType;
  customStyle?: CSSProperties;
  isTooltip?: boolean;
  tooltipData?: {
    title?: string;
    description?: string;
  };
  isProgressStatus?: boolean;
  rightIcon?: string;
  leftIcon?: string;
  iconStyle?: CSSProperties;
  leftIconStyle?: CSSProperties;
  iconOnMouseOver?: () => void;
  iconOnMouseLeave?: () => void;
  tooltipComponent?: () => React.ReactNode;
  t?: i18n.TFunction<'translation'>;
};

function StatusCard({
  text = '',
  status,
  size,
  type,
  theme,
  customStyle,
  isTooltip,
  tooltipData,
  isProgressStatus,
  rightIcon,
  leftIcon,
  leftIconStyle,
  iconStyle,
  iconOnMouseOver,
  iconOnMouseLeave,
  tooltipComponent,
  t,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const onTooltipHandler = (flag: boolean) => {
    if (!isTooltip) return;

    if (flag === true || flag === false) {
      setIsOpen(flag);
    } else {
      setIsOpen((isOpen: boolean) => !isOpen);
    }
  };

  return (
    <div className={cx('jp', size)}>
      <div
        className={cx(status, type, theme)}
        onMouseOver={() => {
          onTooltipHandler(true);
        }}
        onMouseLeave={() => {
          onTooltipHandler(false);
        }}
        style={customStyle}
      >
        {leftIcon && (
          <img
            style={leftIconStyle}
            className={cx('icon', isProgressStatus && 'progress')}
            src={leftIcon}
            alt=''
          />
        )}
        {t ? t(text) : text}
        {rightIcon && (
          <img
            style={iconStyle}
            className={cx('icon', isProgressStatus && 'progress')}
            src={rightIcon}
            alt=''
            onMouseOver={iconOnMouseOver}
            onMouseLeave={iconOnMouseLeave}
          />
        )}
      </div>
      {isOpen &&
        (tooltipComponent ? tooltipComponent() : <Balloon {...tooltipData} />)}
    </div>
  );
}

StatusCard.defaultProps = {
  status: 'running',
  text: '',
  size: 'medium',
  type: 'default',
  theme: theme.PRIMARY_THEME,
  customStyle: undefined,
  tooltipComponent: undefined,
  tooltipData: undefined,
  isProgressStatus: false,
  rightIcon: undefined,
  leftIcon: undefined,
  iconStyle: undefined,
  leftIconStyle: undefined,
  iconOnMouseOver: undefined,
  iconOnMouseLeave: undefined,
  isTooltip: false,
  t: undefined,
};

export default StatusCard;
