import styles from './ScrollView.module.scss';
import classNames from 'classnames/bind';

import { CommonProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  scroll?: 'horizontal' | 'vertical';
} & CommonProps;

function ScrollView({
  scroll = 'vertical',
  className,
  style,
  children,
}: Props) {
  return (
    <div className={cx('scrollview-frame', scroll, className)} style={style}>
      <div className={cx('scrollview-contents')}>{children}</div>
    </div>
  );
}

export type { Props as ScrollViewPropType };

export default ScrollView;
