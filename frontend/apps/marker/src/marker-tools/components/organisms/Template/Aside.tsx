import styles from './Template.module.scss';
import classNames from 'classnames/bind';

import { CommonProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = Pick<CommonProps, 'children' | 'style'>;

function Aside({ children, style }: Props) {
  return (
    <div className={cx('template-aside')} style={style}>
      {children}
    </div>
  );
}

export default Aside;
