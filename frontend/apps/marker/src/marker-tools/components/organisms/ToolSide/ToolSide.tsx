import {} from 'react';

import styles from './ToolSide.module.scss';
import classNames from 'classnames/bind';

import { CommonProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = Pick<CommonProps, 'children'>;

function ToolSide({ children }: Props) {
  return <div className={cx('toolside-container')}>{children}</div>;
}

export default ToolSide;
