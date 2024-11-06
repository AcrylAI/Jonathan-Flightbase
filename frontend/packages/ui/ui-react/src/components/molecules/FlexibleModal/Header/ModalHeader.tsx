import { ModalHeaderArgs } from '../types';
import styles from './ModalHeader.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);
export default function ModalHeader({ title }: ModalHeaderArgs) {
  return (
    <div className={cx('header-container')}>
      <div className={cx('left-side')}>
        <div className={cx('title')}>{title}</div>
      </div>
      <div className={cx('right-side')}></div>
    </div>
  );
}
