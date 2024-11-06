// Style
import styles from './ProgressItem.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

// Image
const numActive1 = '/Images/member/register/00-ic-basic-check.svg';

type ProgressItemProps = {
  progressIndex?: number;
  progressNow?: number;
  text: string;
};

ProgressItem.defaultProps = {
  progressIndex: 0,
  progressNow: 0,
};

function ProgressItem({
  progressIndex = 0,
  progressNow = 0,
  text,
}: ProgressItemProps) {
  return (
    <div className={cx('progress-container')}>
      <div
        className={cx('progress-num', {
          isActive: progressIndex <= progressNow,
        })}
      >
        {progressIndex < progressNow ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={numActive1} alt='numActive1' />
        ) : (
          <span>{progressIndex}</span>
        )}
      </div>
      <span>{text}</span>
    </div>
  );
}

export default ProgressItem;
