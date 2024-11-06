import styles from './HiddenView.module.scss';
import classNames from 'classnames/bind';
import { CommonProps } from "@tools/types/components";

const cx = classNames.bind(styles);

function HiddenView({
  className,
  style,
}: Pick<CommonProps, 'style' | 'className'>) {
  return <div className={cx('hiddenview', className)} style={style} />;
}

export default HiddenView;
