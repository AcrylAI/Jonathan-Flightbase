// CSS Type
import style from './Popup.module.scss';
// CSS Module
import classNames from 'classnames/bind';

import type { Properties as CSSProperties } from 'csstype';

const cx = classNames.bind(style);

type Props = {
  children: JSX.Element;
  isOpen: boolean;
  size?: 'sm' | 'md' | 'lg';
  align?: {
    vertical?: 'top' | 'bottom';
    horizontal?: 'right' | 'left' | 'middle';
  };
  customStyle?: CSSProperties;
};

function Popup({ children, isOpen, size, align, customStyle }: Props) {
  return (
    <div
      className={cx(
        'popup',
        isOpen && 'active',
        size,
        align?.vertical,
        align?.horizontal,
      )}
      style={customStyle}
    >
      {children}
    </div>
  );
}

Popup.defaultProps = {
  size: 'md',
  align: {
    vertical: 'bottom',
    horizontal: 'middle',
  },
  customStyle: {},
};

export default Popup;
