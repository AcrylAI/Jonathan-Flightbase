import styles from './ModalContainer.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);
export default function ModalContainer({ children }: any) {
  return <div className={cx('modal-container')}>{children}</div>;
}
