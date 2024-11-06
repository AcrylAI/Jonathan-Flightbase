// CSS Module
import classNames from 'classnames/bind';
import style from './Stack.module.scss';
const cx = classNames.bind(style);

function Stack({ rate }) {
  return (
    <div className={cx('stack-wrap')}>
      <div className={cx('stack')}>
        <div
          className={cx(
            'fill',
            rate >= 90 && 'danger',
            rate >= 70 && rate <= 89 && 'warn',
          )}
          style={{ width: `${rate}%` }}
        ></div>
      </div>
      <span className={cx('rate')}>
        {rate !== null ? (
          `${Math.floor(rate)}%`
        ) : (
          <span className={cx('error')}>error</span>
        )}
      </span>
    </div>
  );
}

export default Stack;
