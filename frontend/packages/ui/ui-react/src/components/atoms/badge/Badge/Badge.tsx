import { Properties as CSSProperties } from 'csstype';

import classNames from 'classnames/bind';
import style from './Badge.module.scss';
const cx = classNames.bind(style);

type Props = {
  label?: string;
  type?: string;
  title?: string;
  customStyle?: CSSProperties;
};

function Badge({ label, type, title, customStyle }: Props): JSX.Element {
  return (
    <span style={customStyle} className={cx('badge', type)} title={title}>
      {label}
    </span>
  );
}

Badge.defaultProps = {
  label: undefined,
  type: undefined,
  title: undefined,
  customStyle: undefined,
};

export default Badge;
