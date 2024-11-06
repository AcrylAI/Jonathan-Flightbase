// Style
import styles from './ContentTitle.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function ContentTitle({ text }) {
  return (
    <div className={cx('text-box')}>
      <span className={cx('text')}>{text}</span>
    </div>
  );
}

export default ContentTitle;
