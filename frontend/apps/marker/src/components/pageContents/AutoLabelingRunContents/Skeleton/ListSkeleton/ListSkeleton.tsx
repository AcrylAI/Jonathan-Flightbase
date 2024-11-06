import style from './ListSkeleton.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ListSkeleton() {
  return (
    <div className={cx('container')}>
      {[0, 1, 2, 3, 4, 5].map((_, idx) => {
        return (
          <div key={idx} className={cx('list')}>
            <div className={cx('list-left')}>
              <div></div>
            </div>
            <div className={cx('list-center')}>
              <div></div>
              <div></div>
            </div>
            <div className={cx('list-right')}>
              <div className={cx('column', 'left')}>
                <div className={cx('top')}>
                  <div className={cx('left-edge')}></div>
                  <div className={cx('right-edge')}></div>
                </div>
                <div className={cx('bottom')}></div>
              </div>
              <div className={cx('column', 'right')}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListSkeleton;
