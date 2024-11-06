// Style
import styles from './ContentSubTitle.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function ContentSubTitle({ text, isRquired = false }) {
  return (
    <div className={cx('text-box')}>
      <span className={cx('text')}>{text}</span>
      {isRquired ? (
        <span className={cx('required-text required')}>(필수)</span>
      ) : (
        <span className={cx('required-text')}>(선택)</span>
      )}
    </div>
  );
}

export default ContentSubTitle;
