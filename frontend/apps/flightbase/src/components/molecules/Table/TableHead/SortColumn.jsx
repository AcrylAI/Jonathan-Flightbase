// Images
import ArrowTop from '@src/static/images/icon/arrowTop.svg';
import ArrowBottom from '@src/static/images/icon/arrowBottom.svg';

// Style
import styles from './SortColumn.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

function SortColumn({ title, onClickHandler, idx, sortClickFlag }) {
  return (
    <div onClick={() => onClickHandler(idx)} className={cx('container')}>
      <div className={cx('title')}>{title}</div>
      <div className={cx('sort')}>
        <img
          className={cx(sortClickFlag && sortClickFlag[idx] && 'dark')}
          src={ArrowTop}
          alt=''
        />
        <img
          className={cx(
            sortClickFlag &&
              !sortClickFlag[idx] &&
              sortClickFlag[idx] !== undefined &&
              'dark',
          )}
          src={ArrowBottom}
          alt=''
        />
      </div>
    </div>
  );
}

export default SortColumn;
