// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type ServiceCardProps = {
  children: JSX.Element;
};

function Index({ children }: ServiceCardProps) {
  return (
    <div className={cx('serviceCard')}>
      <div className={cx('shadow-layer2')}></div>
      <div className={cx('shadow-layer1')}></div>
      <div className={cx('serviceCard__body')}>{children}</div>
    </div>
  );
}

export default Index;
