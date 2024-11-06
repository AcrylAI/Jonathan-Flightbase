import styles from './ModalContainer.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type ModalContainerProps = {
  children?: JSX.Element;
};
const ModalContainer = ({ children }: ModalContainerProps) => {
  return <div className={cx('modal-container')}>{children}</div>;
};
ModalContainer.defaultProps = {
  children: <></>,
};

export default ModalContainer;
