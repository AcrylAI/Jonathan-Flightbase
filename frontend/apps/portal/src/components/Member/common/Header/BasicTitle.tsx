// Style
import styles from './BasicTitle.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type BasicTitleProps = {
  text: string;
};

function BasicTitle({ text }: BasicTitleProps) {
  return <p className={cx('basic-title')}>{text}</p>;
}

export default BasicTitle;
