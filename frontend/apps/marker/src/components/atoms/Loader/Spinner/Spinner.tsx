import styles from './Spinner.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  width?: number;
  height?: number;
};
const Spinner = ({ width, height }: Props) => {
  return (
    <div className={cx('container')}>
      <div
        className={cx('mover')}
        style={{ width: `${width}px`, height: `${height}px` }}
      ></div>
    </div>
  );
};

Spinner.defaultProps = {
  width: 48,
  height: 48,
};

export default Spinner;
