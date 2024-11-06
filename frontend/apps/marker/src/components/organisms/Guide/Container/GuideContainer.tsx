import styles from './GuideContainer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  children?: JSX.Element;
};
const GuideContainer = ({ children }: Props) => {
  return <div className={cx('guide-container')}>{children}</div>;
};
GuideContainer.defaultProps = {
  children: <></>,
};

export default GuideContainer;
